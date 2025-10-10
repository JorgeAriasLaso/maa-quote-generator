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

  const {
    data: quote,
    isLoading,
    error,
  } = useQuery<Quote>({
    queryKey: ["/api/quotes", id],
    queryFn: async () => {
      const response = await fetch(`/api/quotes/${id}`);
      if (!response.ok) throw new Error("Quote not found");
      return response.json();
    },
    enabled: !!id,
  });

  const downloadQuotePdf = useCallback(async () => {
    try {
      const root = document.getElementById("quote-root");
      if (!root) throw new Error("#quote-root not found");

      const payload = {
        html: root.outerHTML,
        title: `quote-${quote?.quoteNumber || id}`,
        baseUrl: window.location.origin,
      };

      const res = await fetch("/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${payload.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  }, [id, quote?.quoteNumber]);

  if (isLoading) return <div className="p-8 text-center">Loading quote...</div>;
  if (error || !quote)
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Quote not found</h2>
        <Button onClick={() => setLocation("/quotes")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quotes
        </Button>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => setLocation("/quotes")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quotes
        </Button>
        <Button onClick={downloadQuotePdf}>Download PDF</Button>
      </div>

      <div id="quote-root">
        <QuotePreview quote={quote} />
      </div>
    </div>
  );
}
