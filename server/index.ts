import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
process.env.PUPPETEER_CACHE_DIR ||= '/tmp/puppeteer';
process.env.PUPPETEER_DOWNLOAD_PATH ||= '/tmp/puppeteer';


const app = express();

/** --- global middleware --- */
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

/** --- health check for Render --- */
app.get("/healthz", (_req, res) => res.type("text/plain").send("ok"));

/** --- request logging for /api routes (kept from your original) --- */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  // @ts-expect-error - spread for original .json signature
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {}
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

/** --- PDF endpoints --- */
app.get("/pdf/test", (_req, res) => {
  res.type("text/plain").send("PDF test works!");
});

/** ✅ FINAL, SINGLE /pdf ROUTE (auto-detect CSS + crisp print) */
app.post("/pdf", async (req: Request, res: Response) => {
  const { html, title = "quote", baseUrl = "" } = (req.body ?? {}) as {
    html?: string;
    title?: string;
    baseUrl?: string;
    const inferredBase = baseUrl || req.get("origin") || `${req.protocol}://${req.get("host")}`;
  };

  if (!html) return res.status(400).json({ error: "Missing 'html' in request body" });
 
  const withBase = (p: string) =>
  p.startsWith("http") ? p : `${inferredBase.replace(/\/$/, "")}/${p.replace(/^\//, "")}`;

  // 1) Discover current hashed CSS files from your homepage
  let cssHrefs: string[] = [];
  try {
    const resp = await fetch(withBase("/"), { method: "GET" });
    const homeHtml = await resp.text();
    const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(homeHtml))) {
      const href = m[1];
      if (/^\/?assets\/.+\.css(\?.*)?$/i.test(href)) cssHrefs.push(withBase(href));
    }
  } catch (e) {
    console.warn("Could not fetch homepage to discover CSS:", e);
  }

  if (cssHrefs.length === 0) {
    console.warn("⚠️ No CSS stylesheets discovered; PDF may be unstyled.");
  }
  const cssLinks = cssHrefs.map((href) => `<link rel="stylesheet" href="${href}">`).join("\n");

  // 2) Build full HTML (use real CSS, inject your HTML AS-IS; no extra wrapper)
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <base href="${inferredBase.replace(/\/?$/, "/")}" />
  ${cssLinks}
  <style>
    /* Page & print behavior */
    @page { size: A4; margin: 10mm; }
    html, body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: white;
      margin: 0; padding: 0;
    }
    /* Keep everything inside printable area (A4 210mm - 2x10mm) */
    body > * {
      max-width: 190mm;
      margin: 0 auto;
      box-sizing: border-box;
    }
    /* Avoid cutoffs and huge gaps */
    * { box-sizing: border-box; word-break: break-word; overflow-wrap: anywhere; }
    h1,h2,h3,h4,h5,h6,p,ul,ol,li,div,section {
      margin-top: 0.4rem !important;
      margin-bottom: 0.4rem !important;
      line-height: 1.3 !important;
    }
    img, video, canvas {
      max-width: 100% !important; height: auto !important;
      page-break-inside: avoid; break-inside: avoid;
    }
    /* Opt-in class to keep blocks together */
    .avoid-break { page-break-inside: avoid; break-inside: avoid; }
  </style>
</head>
<body>
  ${html}
  <script>
    (function() {
      const imgs = Array.from(document.images || []);
      imgs.forEach(img => { try { img.loading = 'eager'; } catch(_){} });
      window.__imagesReady = Promise.all(imgs.map(img => {
        if (img.complete && img.naturalWidth) return Promise.resolve();
        return new Promise(r => {
          img.addEventListener('load', r, { once: true });
          img.addEventListener('error', r, { once: true });
        });
      }));
    })();
  </script>
</body>
</html>`;

  // 3) Print with puppeteer-core + @sparticuz/chromium
  let browser: import("puppeteer-core").Browser | null = null;
  try {
    const executablePath = await chromium.executablePath();
    browser = await puppeteer.launch({
      headless: chromium.headless,
      executablePath,
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1 },
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60_000);
    page.setDefaultTimeout(60_000);

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    try {
      await page.evaluate(async () => {
        if ((document as any)?.fonts?.ready) await (document as any).fonts.ready;
        if ((window as any).__imagesReady) await (window as any).__imagesReady;
      });
    } catch {}

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      scale: 0.95, // safety margin to avoid right-edge cut
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);
    res.end(pdfBuffer);
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ error: "PDF generation failed" });
  } finally {
    try { await browser?.close(); } catch {}
  }
});

/** --- your existing boot + routes + error handling (unchanged) --- */
(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    { port, host: "0.0.0.0", reusePort: true },
    () => { log(`serving on port ${port}`); }
  );
})();
