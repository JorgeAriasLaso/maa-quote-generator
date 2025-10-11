import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { QuotePreview } from "@/components/quote-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import type { Quote } from "@shared/schema";

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: quote, isLoading, error } = useQuery<Quote>({
    queryKey: ["/api/quotes", id],
    queryFn: async () => {
      const response = await fetch(`/api/quotes/${id}`);
      if (!response.ok) throw new Error("Quote not found");
      return response.json();
    },
    enabled: !!id,
  });

  // ✅ Render backend origin so the server can load its own CSS/assets
  const API = "https://maa-quote-generator.onrender.com";

  const downloadQuotePdf = useCallback(async () => {
    const root = document.getElementById("quote-root");
    if (!root) {
      alert("Sorry, can't find the quote on the page.");
      return;
    }

    const payload = {
      html: root.outerHTML, // exactly what's visible
      title: `quote-${quote?.quoteNumber || id}`,
      baseUrl: API,         // 👈 IMPORTANT: backend origin, not window.location
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
    } catch (e) {
      console.error(e);
      alert("Sorry, the PDF could not be generated.");
    }
  }, [API, id, quote?.quoteNumber]);

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
            <Button onClick={() => setLocation('/quotes')}>
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
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Button variant="outline" onClick={() => setLocation('/quotes')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotes
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Quote Details - {quote.quoteNumber}
          </h1>
        </div>

        {/* Use your existing UI; just point it to the new handler */}
        <Button onClick={downloadQuotePdf}>
          Download PDF
        </Button>
      </div>

      {/* Everything that should appear in the PDF */}
      <div id="quote-root">
        <QuotePreview quote={quote} />
      </div>
    </div>
  );
}
