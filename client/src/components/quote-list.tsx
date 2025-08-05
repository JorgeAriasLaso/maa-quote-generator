import { useQuery } from "@tanstack/react-query";
import { type Quote } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, GraduationCap, FileText, Eye, Copy, Trash2, Home, TrendingUp, DivideIcon as Divide } from "lucide-react";
import { format } from "date-fns";
import { calculateQuoteCost, type AdhocService } from "@shared/costing";

interface QuoteListProps {
  onViewQuote?: (quote: Quote) => void;
  onEditQuote?: (quote: Quote) => void;
  onCopyQuote?: (quote: Quote) => void;
  onDeleteQuote?: (quote: Quote) => void;
}

// Helper function to calculate profitability metrics for a quote
function calculateQuoteProfitability(quote: Quote) {
  const adhocServices: AdhocService[] = quote.adhocServices ? JSON.parse(quote.adhocServices) : [];
  
  const customPricing = {
    studentAccommodationPerDay: parseFloat(quote.studentAccommodationPerDay || "0"),
    teacherAccommodationPerDay: parseFloat(quote.teacherAccommodationPerDay || "0"),
    breakfastPerDay: parseFloat(quote.breakfastPerDay || "0"),
    lunchPerDay: parseFloat(quote.lunchPerDay || "0"),
    dinnerPerDay: parseFloat(quote.dinnerPerDay || "0"),
    transportCardTotal: parseFloat(quote.transportCardTotal || "0"),
    studentCoordinationFeeTotal: parseFloat(quote.studentCoordinationFeeTotal || "0"),
    teacherCoordinationFeeTotal: parseFloat(quote.teacherCoordinationFeeTotal || "0"),
    airportTransferPerPerson: parseFloat(quote.airportTransferPerPerson || "0"),
  };

  const internalCosts = {
    costStudentAccommodationPerDay: parseFloat(quote.costStudentAccommodationPerDay || "0"),
    costTeacherAccommodationPerDay: parseFloat(quote.costTeacherAccommodationPerDay || "0"),
    costBreakfastPerDay: parseFloat(quote.costBreakfastPerDay || "0"),
    costLunchPerDay: parseFloat(quote.costLunchPerDay || "0"),
    costDinnerPerDay: parseFloat(quote.costDinnerPerDay || "0"),
    costLocalTransportationCard: parseFloat(quote.costLocalTransportationCard || "0"),
    costStudentCoordination: parseFloat(quote.costStudentCoordination || "60"),
    costTeacherCoordination: parseFloat(quote.costTeacherCoordination || "0"),
    costLocalCoordinator: parseFloat(quote.costLocalCoordinator || "150"),
    costAirportTransfer: quote.costAirportTransfer || "0",
  };

  const costBreakdown = calculateQuoteCost(
    quote.destination,
    quote.duration,
    quote.numberOfStudents,
    quote.numberOfTeachers,
    adhocServices,
    customPricing,
    internalCosts
  );

  const totalTravellers = quote.numberOfStudents + quote.numberOfTeachers;
  const averageProfitPerTraveller = totalTravellers > 0 ? costBreakdown.profitability.netProfit / totalTravellers : 0;

  return {
    netProfit: costBreakdown.profitability.netProfit,
    averageProfitPerTraveller,
    total: costBreakdown.total
  };
}

export function QuoteList({ onViewQuote, onEditQuote, onCopyQuote, onDeleteQuote }: QuoteListProps) {
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
                {onDeleteQuote && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteQuote(quote)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="font-medium">{quote.destination}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4 text-slate-500" />
                <span className="text-xs">{quote.studentAccommodationName || 'Not specified'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>{quote.startDate} - {quote.endDate}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-slate-500" />
                <span>{quote.numberOfStudents}S / {quote.numberOfTeachers}T</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-900">
                  €{(() => {
                    const { total } = calculateQuoteProfitability(quote);
                    return Math.round(total).toLocaleString();
                  })()}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {quote.tripType}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Net Profit</div>
                <div className={`text-sm font-medium ${(() => {
                  const { netProfit } = calculateQuoteProfitability(quote);
                  return netProfit >= 0 ? 'text-green-600' : 'text-red-600';
                })()}`}>
                  {(() => {
                    const { netProfit } = calculateQuoteProfitability(quote);
                    return `€${Math.round(netProfit).toLocaleString()}`;
                  })()}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Avg Profit/Traveller</div>
                <div className={`text-sm font-medium ${(() => {
                  const { averageProfitPerTraveller } = calculateQuoteProfitability(quote);
                  return averageProfitPerTraveller >= 0 ? 'text-green-600' : 'text-red-600';
                })()}`}>
                  {(() => {
                    const { averageProfitPerTraveller } = calculateQuoteProfitability(quote);
                    return `€${Math.round(averageProfitPerTraveller).toLocaleString()}`;
                  })()}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Per Student/Teacher</div>
                <div className="text-sm font-medium text-slate-900">
                  €{quote.pricePerStudent}/€{quote.pricePerTeacher}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Badge variant="outline">
                {quote.duration}
              </Badge>
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