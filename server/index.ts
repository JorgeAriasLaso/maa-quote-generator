import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

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

app.post("/pdf", async (req: Request, res: Response) => {
  const { html, title = "quote", baseUrl = "" } = (req.body ?? {}) as {
    html?: string;
    title?: string;
    baseUrl?: string;
  };

  if (!html) return res.status(400).json({ error: "Missing 'html' in request body" });

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: A4; margin: 16mm; }
    html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
  </style>
  ${baseUrl ? `<base href="${baseUrl.replace(/\/?$/, "/")}" />` : ""}
</head>
<body>
  <div id="quote-root">${html}</div>
</body>
</html>`;

  let browser: puppeteer.Browser | null = null;

  try {
    // Configure chromium for serverless (Render)
    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      headless: chromium.headless,
      executablePath,
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
      defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1 },
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60_000);
    page.setDefaultTimeout(60_000);

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    try {
      await page.evaluate(async () => {
        // @ts-ignore
        if (document?.fonts?.ready) await (document as any).fonts.ready;
      });
    } catch {}

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "16mm", right: "16mm", bottom: "16mm", left: "16mm" },
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
