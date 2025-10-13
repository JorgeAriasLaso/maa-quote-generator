// server/pdfClient.js
// This file will contact your Render app to make PDFs

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL; // example: https://your-render-app.onrender.com/generate-pdf

async function generatePdfRemote(payload) {
  const res = await fetch(PDF_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("PDF service returned an error");
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

module.exports = { generatePdfRemote };
