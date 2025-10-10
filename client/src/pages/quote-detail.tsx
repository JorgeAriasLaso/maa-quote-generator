import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { QuotePreview } from "@/components/quote-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useCallback } from "react";
import type { Quote } from "@shared/schema";

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  // Check for download parameter
  const urlParams = new URLSearchParams(window.location.search);
  const shouldDownload = urlParams.get("download") === "true";

  const { data: quote, isLoading, error } = useQuery<Quote>({
    queryKey: ["/api/quotes", id],
    queryFn: async () => {
      const response = await fetch(`/api/quotes/${id}`);
      if (!response.ok) {
        throw new Error("Quote not found");
      }
      return response.json();
    },
    enabled: !!id,
  });

  // 🔗 Render backend (where readable PDFs are generated)
  const API = "https://maa-quote-generator.onrender.com";

  // ⬇️ Download logic (no new button; we trigger via custom event)
  const downloadQuotePdf = useCallback(async () => {
    const root = document.getElementById("quote-root");
    if (!root) {
      console.error("#quote-root not found");
      return;
    }

    const payload = {
      html: root.outerHTML,                         // the actual visible quote
      title: `quote-${quote?.quoteNumber || id}`,   // filename
      baseUrl: window.location.origin,              // resolve relative URLs
    };

    try {
      const res = await fetch(`${API}/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/pdf" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`PDF failed (${res.status})`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${payload.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Sorry, the PDF could not be generated.");
    }
  }, [API, id, quote?.quoteNumber]);

  // Listen for your existing custom event "download-pdf"
  useEffect(() => {
    const handler = () => downloadQuotePdf();
    document.addEventListener("download-pdf", handler);
    return () => document.removeEventListener("download-pdf", handler);
  }, [downloadQuotePdf]);

  // Auto-download PDF if ?download=true
  useEffect(() => {
    if (quote && shouldDownload) {
      // small delay to ensure the component is fully rendered
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent("download-pdf"));
        // optional: navigate back to quotes after download
        setTimeout(() => setLocation("/quotes"), 1000);
      }, 500);
    }
  }, [quote, shouldDownload, setLocation]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading quote...</div>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h2>
            <p className="text-gray-600 mb-4">The requested quote could not be found.</p>
            <Button onClick={() => setLocation("/quotes")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quotes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setLocation("/quotes")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quotes
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          Quote Details - {quote.quoteNumber}
        </h1>
      </div>

      {/* IMPORTANT: everything to appear in the PDF is inside this wrapper */}
      <div id="quote-root">
        <QuotePreview quote={quote} />
      </div>
    </div>
  );
}
