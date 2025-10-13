// server/pdfClient.ts
// This file contacts your Render app to make PDFs

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL; // e.g. https://your-render-app.onrender.com/generate-pdf

if (!PDF_SERVICE_URL) {
  throw new Error("Missing env var PDF_SERVICE_URL");
}

export async function generatePdfRemote(payload: Record<string, any>): Promise<Buffer> {
  const res = await fetch(PDF_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`PDF service returned ${res.status}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}
