import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { QuotePreview } from "@/components/quote-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
        </div>

      {/* Everything that should appear in the PDF */}
      <div id="quote-root">
        <QuotePreview quote={quote} />
      </div>
    </div>
  );
}
