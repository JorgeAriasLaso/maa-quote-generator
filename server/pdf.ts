import express from "express";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const pdfRouter = express.Router();

/** Quick test in a browser: GET /pdf/test */
pdfRouter.get("/test", async (_req, res) => {
  const html = `
    <!doctype html><html><head><meta charset="utf-8">
    <style>
      @page { size: A4; margin: 12mm; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      html, body { font-family: system-ui, sans-serif; font-size: 11pt; }
      .section { border: 2px solid #2E86DE; border-radius: 10px; padding: 12px 14px; background: #EAF3FF; margin: 10px 0; }
      h1, h2, .section { break-inside: avoid; }
      img { max-width: 100%; height: auto; display: block; }
    </style>
    </head><body>
      <h1>Hello My Abroad Ally</h1>
      <p>This is <b>selectable text</b> inside a colored frame:</p>
      <div class="section">Airport transfers • Accommodation • Internships</div>
      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg" width="320">
    </body></html>
  `;

  const browser = await puppeteer.launch({
    args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.evaluate(async () => {
      try {
        await (document as any).fonts.ready;
      } catch {}
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=test.pdf");
    res.end(pdf);
  } catch (e) {
    console.error("PDF test error:", e);
    res.status(500).send("PDF generation failed");
  } finally {
    await browser.close();
  }
});

/** Production endpoint: POST /pdf  (body: { html, baseUrl? }) */
pdfRouter.post("/", async (req, res) => {
  const { html, baseUrl } = req.body || {};
  const browser = await puppeteer.launch({
    args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();

    if (baseUrl) {
      await page.goto(baseUrl, { waitUntil: "networkidle0" });
    }

    await page.setContent(html || "<html><body></body></html>", {
      waitUntil: "networkidle0",
    });

    await page.evaluate(async () => {
      try {
        await (document as any).fonts.ready;
      } catch {}
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=quote.pdf");
    res.end(pdf);
  } catch (err) {
    console.error("PDF error:", err);
    res.status(500).send("PDF generation failed");
  } finally {
    await browser.close();
  }
});
