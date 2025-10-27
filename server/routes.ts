import { generatePdfRemote } from "./pdfClient";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import puppeteer from "puppeteer-core";
import chromium from '@sparticuz/chromium';
import { insertQuoteSchema, insertClientSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import fs from "fs";
import path from "path";
import express from "express";
import sharp from "sharp";
import fetch from "node-fetch";

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: uploadStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 6 // Max 6 files
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // /img-opt?url=ENCODED_URL&w=1500&q=72&fmt=jpeg
app.get("/img-opt", async (req, res) => {
  try {
    const url = req.query.url ? String(req.query.url) : "";
    if (!url.startsWith("http")) {
      return res.status(400).send("Missing or invalid ?url");
    }

    const width = req.query.w ? Math.min(Number(req.query.w), 2400) : 1500; // sane cap
    const quality = req.query.q ? Math.min(Number(req.query.q), 95) : 72;
    const fmtParam = (req.query.fmt ? String(req.query.fmt) : "jpeg").toLowerCase();
    const fmt: "jpeg" | "webp" = fmtParam === "webp" ? "webp" : "jpeg";

    const r = await fetch(url);
    if (!r.ok) return res.status(400).send("Bad image URL");
    const input = Buffer.from(await r.arrayBuffer());

    let pipeline = sharp(input).rotate().resize({ width, withoutEnlargement: true }).withMetadata({ orientation: false });

    if (fmt === "jpeg") {
      pipeline = pipeline.jpeg({ quality, progressive: true, chromaSubsampling: "4:2:0" });
    } else {
      pipeline = pipeline.webp({ quality });
    }

    const out = await pipeline.toBuffer();
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.type(fmt).send(out);
  } catch (err) {
    res.status(500).send("Image optimize error");
  }
});

  
  // Get all quotes
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getAllQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  // Get quote by ID
  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }

      const quote = await storage.getQuote(id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  // Create new quote
  app.post("/api/quotes", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(validatedData);

      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create quote" });
      }
    }
  });

  // Update quote
  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }

      const validatedData = insertQuoteSchema.partial().parse(req.body);
      const updatedQuote = await storage.updateQuote(id, validatedData);

      if (!updatedQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      res.json(updatedQuote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update quote" });
      }
    }
  });

  // Delete quote
  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }

      const deleted = await storage.deleteQuote(id);
      if (!deleted) {
        return res.status(404).json({ message: "Quote not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // Upload images
  app.post("/api/upload-images", upload.array('images', 6), (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const filePaths = req.files.map(file => `/uploads/${file.filename}`);
      res.json({ filePaths });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload images" });
    }
  });

  // Copy quote
  app.post("/api/quotes/:id/copy", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }

      const originalQuote = await storage.getQuote(id);
      if (!originalQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      // Create a copy without the id, createdAt, and quoteNumber
      const { id: _, createdAt, quoteNumber, ...quoteCopy } = originalQuote;
      
      // Generate new quote number
      const now = new Date();
      const year = now.getFullYear();
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const newQuoteNumber = `TPQ-${year}-${randomId}`;

      // Properly handle data types for validation
      const sanitizedQuoteCopy: any = {};
      
      // Define numeric fields that should be numbers or null
      const numericFields = ['clientId', 'numberOfStudents', 'numberOfTeachers'];
      
      // Define decimal fields that should be decimal or string
      const decimalFields = ['pricePerStudent'];
      
      for (const [key, value] of Object.entries(quoteCopy)) {
        if (numericFields.includes(key)) {
          // Handle numeric fields - keep as number or null
          sanitizedQuoteCopy[key] = value === null ? null : value;
        } else if (decimalFields.includes(key)) {
          // Handle decimal fields - keep as is
          sanitizedQuoteCopy[key] = value;
        } else {
          // Handle text fields - convert null to empty string
          sanitizedQuoteCopy[key] = value === null ? "" : value;
        }
      }

      const newQuoteData = {
        ...sanitizedQuoteCopy,
        quoteNumber: newQuoteNumber,
      };

      const validatedData = insertQuoteSchema.parse(newQuoteData);
      const newQuote = await storage.createQuote(validatedData);
      
      res.status(201).json(newQuote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      } else {
        console.error("Error copying quote:", error);
        res.status(500).json({ message: "Failed to copy quote" });
      }
    }
  });

  // Client management routes
  // Get all clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Get client by ID
  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  // Create new client
  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);

      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid client data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create client" });
      }
    }
  });

  // Import clients from CSV
  app.post("/api/clients/import-csv", async (req, res) => {
    try {
      const { csvData } = req.body;
      if (!csvData || !Array.isArray(csvData)) {
        return res.status(400).json({ message: "Invalid CSV data" });
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < csvData.length; i++) {
        try {
          const row = csvData[i];
          const clientData = {
            fiscalName: row.fiscalName || row["Fiscal Name"] || "",
            taxId: row.taxId || row["Tax ID"] || "",
            email: row.email || row["Email"] || "",
            country: row.country || row["Country"] || "",
            city: row.city || row["City"] || "",
            postcode: row.postcode || row["Postcode"] || "",
            address: row.address || row["Address"] || "",
          };

          const result = insertClientSchema.safeParse(clientData);
          if (result.success) {
            const client = await storage.createClient(result.data);
            results.push(client);
          } else {
            errors.push({ row: i + 1, errors: result.error.errors });
          }
        } catch (error) {
          errors.push({ row: i + 1, error: "Failed to process row" });
        }
      }

      res.json({
        imported: results.length,
        errors: errors.length,
        clients: results,
        errorDetails: errors
      });
    } catch (error) {
      console.error("Error importing CSV:", error);
      res.status(500).json({ message: "Failed to import CSV" });
    }
  });

  // Update client
  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const validatedData = insertClientSchema.partial().parse(req.body);
      const updatedClient = await storage.updateClient(id, validatedData);

      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(updatedClient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid client data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update client" });
      }
    }
  });

  // Delete client
  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const deleted = await storage.deleteClient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Get quotes for a specific client
  app.get("/api/clients/:id/quotes", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const quotes = await storage.getClientQuotes(id);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client quotes" });
    }
  });



  // PDF Generation endpoint - proper server-side PDF with page breaks
  app.post('/api/generate-pdf', async (req, res) => {
  console.log('[REQ] POST /api/generate-pdf', { htmlLen: req.body?.html?.length ?? 0 });

    try {
      const { html } = req.body;
      
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      // Launch browser
      const browser = await puppeteer.launch({
        args: [...chromium.args, "--disable-pdf-tagging"],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });

      const page = await browser.newPage();
      let interceptedImages = 0;
     await page.setRequestInterception(true);

// Prefer your own base URL if you have one set; otherwise derive from request
const base =
  process.env.PUBLIC_BASE_URL ??
  (req.get("host") ? `https://${req.get("host")}` : "");

// Keep a named handler so we can remove it later
const onRequest = (r: any) => {
  try {
    const url = r.url();
    const type = r.resourceType && r.resourceType();

    // Avoid loops and skip data URIs
    if (!base || url.startsWith("data:") || url.includes("/img-opt")) {
      return r.continue();
    }

    // Only rewrite images (resource type OR common image extensions)
    const isImage =
      type === "image" || /\.(png|jpe?g|webp|gif|bmp|tiff|svg)$/i.test(url);

    if (isImage) {
      interceptedImages++;
      const optimized = `${base}/img-opt?url=${encodeURIComponent(
        url
      )}&w=1500&q=72&fmt=jpeg`;
      return r.continue({ url: optimized });
    }


    
    return r.continue();
  } catch {
    try { r.continue(); } catch {}
  }
};

page.on("request", onRequest);


      await page.setViewport({ width: 1240, height: 1754 }); // A4 at ~150 DPI
      
      // Emulate print media for proper PDF rendering
      await page.emulateMediaType('print');
      
      // Set content with proper CSS for page breaks
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Add CSS for proper page breaks
      await page.addStyleTag({
        content: `
          @page {
            size: A4;
            margin: 15mm;
          }
          
          .educational-value {
            page-break-before: always;
          }
          
          /* Prevent orphans and widows */
          h1, h2, h3 {
            page-break-after: avoid;
          }
          
          .destination-image {
            page-break-inside: avoid;
          }
          
          .cost-breakdown {
            page-break-inside: avoid;
          }
          
          /* PDF-specific styles for uploaded images - scoped by quote type */
          
          /* Additional Services: Use same layout as Madrid - 4 images side-by-side layout */
          .is-additional-services .image-strip { 
            width: 180mm !important;      /* fits across A4 */
            margin: 0 auto 8mm auto;
            display: flex !important;
            flex-wrap: nowrap !important; /* force one row */
            gap: 4mm;                     /* space between images */
            align-items: stretch;
            break-inside: avoid;
            page-break-inside: avoid;
            justify-content: center;
          }
          .is-additional-services .image-strip > div {
            flex: 1 1 0;
            max-width: calc((180mm - 3 * 4mm) / 4); /* 4 images + 3 gaps */
            width: calc((180mm - 3 * 4mm) / 4);
          }
          .is-additional-services .pdf-image {
            width: 100% !important;
            height: 45mm !important;      /* adjust to make bigger/smaller */
            object-fit: cover;            /* crop neatly */
            display: block;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-height: 45mm;
            max-height: 45mm;
          }
          /* Ensure no leftover titles for Additional Services */
          .is-additional-services .image-strip h2,
          .is-additional-services .image-strip .section-title { 
            display: none !important; 
          }
          
          /* Other quote types: Keep existing behavior */
          .pdf-image {
            display: block;
            width: 18cm;
            max-width: 100%;
            height: auto;
            margin: 8px 0;
            page-break-inside: avoid;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        `
      });

      // ↓↓↓ STEP 1: shrink big images in-memory before PDF ↓↓↓
await page.evaluate(async () => {
  const MAX_DIM = 1800;      // cap longest side
  const JPEG_QUALITY = 0.72; // balance quality/size

  function shouldCompress(img: HTMLImageElement) {
    const src = img.currentSrc || img.src || "";
    if (!src) return false;
    if (/logo|icon|favicon|qr/i.test(src)) return false;        // keep tiny assets
    if (/\.svg(\?|#|$)/i.test(src)) return false;               // keep vectors
    const w = img.naturalWidth || 0;
    const h = img.naturalHeight || 0;
    return w * h >= 400 * 400;                                  // only bigger images
  }

  async function compress(el: HTMLImageElement, url: string) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "sync";
    img.src = url;
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("load fail"));
    });

    const longest = Math.max(img.naturalWidth, img.naturalHeight) || 1;
    const scale = Math.min(1, MAX_DIM / longest);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    el.srcset = "";        // force use of our compressed source
    el.src = dataUrl;
  }

  const imgs = Array.from(document.images).filter(shouldCompress);
  for (const el of imgs) {
    try { await compress(el, el.currentSrc || el.src); } catch {}
  }
});
// ↑↑↑ END STEP 1

// 4B-1) Strip loaded webfonts/@font-face to avoid multi-MB font embedding
await page.evaluate(() => {
  document
    .querySelectorAll(
      'link[href*="fonts.googleapis"], link[href*="fonts.gstatic"], link[rel="preload"][as="font"]'
    )
    .forEach(el => el.remove());
  document.querySelectorAll('style').forEach(s => {
    if (s.textContent && s.textContent.includes('@font-face')) s.remove();
  });
});

// 4B-2) Force system fonts & disable rasterizing effects for print only
await page.addStyleTag({
  content: `
  @media print {
    html, body, * {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif !important;
      text-shadow: none !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    * {
      box-shadow: none !important;
      filter: none !important;
      backdrop-filter: none !important;
      mix-blend-mode: normal !important;
      /* If you DO need background images in the PDF, comment the next line */
      background-image: none !important;
    }
  }
  `
});

     // Force all images (including CSS backgrounds and base64) through our optimizer
await page.evaluate(async (base) => {
  const optimizeUrl = (u) =>
    `${base}/img-opt?url=${encodeURIComponent(u)}&w=1500&q=72&fmt=jpeg`;

  // 1) <img src="...">
  document.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('data:')) return; // handled below
    if (/^https?:\/\//i.test(src) && !src.includes('/img-opt?')) {
      img.setAttribute('src', optimizeUrl(src));
    }
  });

  // 2) CSS background-image: url(...)
  const extractUrls = (bg) =>
    (bg.match(/url\(([^)]+)\)/gi) || [])
      .map(s => s.replace(/^url\((['"]?)/, '').replace(/(['"]?)\)$/, ''));

  Array.from(document.querySelectorAll('*')).forEach((el) => {
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === 'none') return;
    const urls = extractUrls(bg);
    if (!urls.length) return;
    const newBg = urls.map((u) => {
      if (u.startsWith('data:')) return u; // handled below
      if (!/^https?:\/\//i.test(u)) return bg; // skip relative; optional: make absolute
      return `url("${optimizeUrl(u)}")`;
    }).join(', ');
    if (newBg) (el as HTMLElement).style.backgroundImage = newBg;
  });

  // 3) Re-encode base64 images (both <img> and background-image)
  async function reencodeDataUrl(dataUrl, maxW = 1500, q = 0.72) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width || 1);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', q));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  // 3a) <img src="data:...">
  const imgNodes = Array.from(document.querySelectorAll('img[src^="data:"]'));
  for (const img of imgNodes) {
    const src = img.getAttribute('src')!;
    const newSrc = await reencodeDataUrl(src);
    (img as HTMLImageElement).src = newSrc as string;
  }

  // 3b) background-image: data:
  const nodes = Array.from(document.querySelectorAll('*'));
  for (const el of nodes) {
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === 'none') continue;
    const urls = extractUrls(bg).filter(u => u.startsWith('data:'));
    if (!urls.length) continue;
    const out: string[] = [];
    for (const u of urls) {
      const nu = await reencodeDataUrl(u);
      out.push(`url("${nu}")`);
    }
    (el as HTMLElement).style.backgroundImage = out.join(', ');
  }
}, `${req.protocol}://${req.get('host')}`);
 
      // Generate PDF
      const pdf = await page.pdf({

      format: 'A4',
  margin: {
    top: '15mm',
    right: '15mm',
    bottom: '15mm',
    left: '15mm'
  },
  printBackground: false,
  preferCSSPageSize: true,
  scale: 1
});

      console.log("[PDF] interceptedImages:", interceptedImages);
res.setHeader("X-PDF-Intercepted-Images", String(interceptedImages));
      
      // ✅ Add this cleanup immediately after PDF generation
page.removeListener("request", onRequest);
try { await page.setRequestInterception(false); } catch {}
      

      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="quote.pdf"');
      res.send(pdf);

    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;

  // Remote PDF generation via Render
app.get("/api/quotes/:id/pdf", async (req, res) => {
  try {
    const pdfBuffer = await generatePdfRemote({ quoteId: req.params.id });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="quote-${req.params.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF error:", err);
    res.status(502).json({ error: "PDF generation failed" });
  }
});
  
  
}


