// server/index.ts
import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (_req, res) => {
  res.send("Server is running ✅");
});

app.get("/pdf/test", (_req, res) => {
  res.setHeader("Content-Type", "application/pdf");
  res.send("PDF test works!");
});

app.post("/pdf", async (req, res) => {
  try {
    const { html, title = "quote", baseUrl = "" } = req.body;

    if (!html) return res.status(400).json({ error: "Missing html" });

    const fullHtml = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>@page { size: A4; margin: 15mm; } body { font-family: sans-serif; }</style>
      </head>
      <body>${html}</body>
    </html>`;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);
    res.end(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
