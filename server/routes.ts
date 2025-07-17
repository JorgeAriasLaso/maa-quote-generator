import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteSchema, insertClientSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

      const newQuoteData = {
        ...quoteCopy,
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

  // PDF Generation route
  app.post('/api/generate-pdf', async (req, res) => {
    try {
      const { html, quoteNumber, fiscalName, destination } = req.body;
      
      // Import puppeteer dynamically
      const puppeteer = await import('puppeteer');
      
      // Launch browser
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set page content with CSS for page breaks
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page { 
              margin: 15mm; 
              size: A4; 
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              line-height: 1.6;
              color: #000;
              background: white;
            }
            
            #educational-value-section {
              page-break-before: always !important;
              break-before: page !important;
              margin-top: 0 !important;
              padding-top: 20px;
            }
            
            .internal-analysis-only {
              display: none !important;
            }
            
            img {
              max-width: 100%;
              height: auto;
            }
            
            .grid {
              display: grid;
              gap: 1rem;
            }
            
            .grid-cols-2 {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .text-center {
              text-align: center;
            }
            
            .font-bold {
              font-weight: bold;
            }
            
            .text-xl {
              font-size: 1.25rem;
            }
            
            .text-lg {
              font-size: 1.125rem;
            }
            
            .mb-4 {
              margin-bottom: 1rem;
            }
            
            .mb-6 {
              margin-bottom: 1.5rem;
            }
            
            .p-4 {
              padding: 1rem;
            }
            
            .bg-yellow-50 {
              background-color: #fefce8;
            }
            
            .border {
              border: 1px solid #e5e7eb;
            }
            
            .rounded {
              border-radius: 0.25rem;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
        </html>
      `;
      
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      
      // Generate PDF with proper page breaks
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      });
      
      await browser.close();
      
      // Set response headers
      const filename = `${quoteNumber}_${fiscalName.replace(/\s+/g, '_')}_${destination.replace(/\s+/g, '_')}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Send PDF
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
