import { useQuery } from "@tanstack/react-query";
import { type Quote } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, GraduationCap, FileText, Eye, Copy } from "lucide-react";
import { format } from "date-fns";

interface QuoteListProps {
  onViewQuote?: (quote: Quote) => void;
  onEditQuote?: (quote: Quote) => void;
  onCopyQuote?: (quote: Quote) => void;
}

export function QuoteList({ onViewQuote, onEditQuote, onCopyQuote }: QuoteListProps) {
  const { data: quotes, isLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-32"></div>
                  <div className="h-4 bg-slate-200 rounded w-48"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-16"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No quotes yet</h3>
          <p className="text-slate-500 mb-4">Get started by creating your first travel quote.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <Card key={quote.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg text-primary">
                  {quote.quoteNumber}
                </CardTitle>
                <p className="text-slate-600 font-medium">{quote.fiscalName}</p>
                <p className="text-sm text-slate-500">{quote.email}</p>
              </div>
              <div className="flex gap-2">
                {onViewQuote && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewQuote(quote)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                )}
                {onCopyQuote && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopyQuote(quote)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                )}
                {onEditQuote && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditQuote(quote)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="font-medium">{quote.destination}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>{quote.startDate} - {quote.endDate}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-slate-500" />
                <span>{quote.numberOfStudents} students</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-slate-500" />
                <span>{quote.numberOfTeachers} teachers</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {quote.tripType}
                </Badge>
                <Badge variant="outline">
                  {quote.duration}
                </Badge>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold text-slate-900">
                  €{quote.pricePerStudent}/student
                </div>
                <div className="text-sm text-slate-600">
                  €{quote.pricePerTeacher}/teacher
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Created {format(new Date(quote.createdAt), "MMM d, yyyy 'at' HH:mm")}</span>
                <span className="text-slate-400">#{quote.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}