import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

/** --- global middleware --- */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

/** --- request logging for /api routes (kept from your original) --- */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    // @ts-expect-error - spread for original .json signature
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          // ignore stringify errors
        }
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

/** --- PDF endpoints (READABLE PDFs with real text & colors) --- */
app.get("/pdf/test", (_req, res) => {
  res.type("text/plain").send("PDF test works!");
});

app.post("/pdf", async (req: Request, res: Response) => {
  try {
    const { html, title = "quote", baseUrl = "" } = (req.body ?? {}) as {
      html?: string;
      title?: string;
      baseUrl?: string;
    };

    if (!html) {
      return res.status(400).json({ error: "Missing 'html' in request body" });
    }

    // Build a full HTML document so styles render correctly in Chromium
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- Tailwind (so your quote styles render) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: A4; margin: 16mm; }
    /* Keep colors & backgrounds in print */
    html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    /* Optional: nicer base font */
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
  </style>
  ${baseUrl ? `<base href="${baseUrl.replace(/\/?$/, "/")}" />` : ""}
</head>
<body>
  <div id="quote-root">${html}</div>
</body>
</html>`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    // Ensure fonts are ready before printing
    // @ts-ignore
    if ((page as any).evaluate) {
      try {
        await page.evaluate(() => (document as any).fonts?.ready?.then?.(() => {}));
      } catch {}
    }

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,          // keep colors, images, backgrounds
      preferCSSPageSize: true,
      margin: { top: "16mm", right: "16mm", bottom: "16mm", left: "16mm" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);
    res.end(pdfBuffer);
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ error: "PDF generation failed" });
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

  // Only set up Vite in development; serve built assets otherwise
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve on the env PORT (Render uses this)
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
