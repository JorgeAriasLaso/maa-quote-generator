import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Quote } from "@shared/schema";
import { QuoteList } from "@/components/quote-list";
import { QuotePreview } from "@/components/quote-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Quote as QuoteIcon, Search, Filter, Download, MapPin, Calendar, Users, GraduationCap, Eye, FileText, Copy, Trash2, Home } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { calculateQuoteCost, type AdhocService } from "@shared/costing";

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
    internalCosts,
    quote.tripType
  );

  const totalTravellers = quote.numberOfStudents + quote.numberOfTeachers;
  const averageProfitPerTraveller = totalTravellers > 0 ? costBreakdown.profitability.netProfit / totalTravellers : 0;

  return {
    netProfit: costBreakdown.profitability.netProfit,
    averageProfitPerTraveller,
    total: costBreakdown.total
  };
}

export default function Quotes() {
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quotes, isLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  // Handle editing quote from sessionStorage (from client management navigation)
  useEffect(() => {
    const storedQuote = sessionStorage.getItem('editingQuote');
    if (storedQuote) {
      try {
        const quote = JSON.parse(storedQuote);
        setViewingQuote(quote);
        // Clear the stored quote so it doesn't persist
        sessionStorage.removeItem('editingQuote');
      } catch (e) {
        console.error('Error parsing editing quote from sessionStorage:', e);
      }
    }
  }, []);

  // Copy quote mutation
  const copyQuoteMutation = useMutation({
    mutationFn: async (quoteId: number) => {
      const response = await apiRequest("POST", `/api/quotes/${quoteId}/copy`);
      return response.json();
    },
    onSuccess: (newQuote) => {
      toast({
        title: "Quote Copied",
        description: `Quote ${newQuote.quoteNumber} has been created. You can now edit it.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      // Navigate to home to edit the new quote
      window.location.href = `/?edit=${newQuote.id}`;
    },
    onError: (error) => {
      console.error("Copy quote error:", error);
      toast({
        title: "Error",
        description: "Failed to copy quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: number) => {
      const response = await apiRequest("DELETE", `/api/quotes/${quoteId}`);
      return response;
    },
    onSuccess: (_, quoteId) => {
      toast({
        title: "Quote Deleted",
        description: "Quote has been permanently deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      setQuoteToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter quotes based on search term and filter type
  const filteredQuotes = quotes?.filter(quote => {
    const matchesSearch = searchTerm === "" || 
      quote.fiscalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.email && quote.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      quote.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterBy === "all" || quote.tripType === filterBy;

    return matchesSearch && matchesFilter;
  });

  const handleViewQuote = (quote: Quote) => {
    setViewingQuote(quote);
  };

  const handleEditQuote = (quote: Quote) => {
    // Navigate to home with quote data
    window.location.href = `/?edit=${quote.id}`;
  };

  const handleCopyQuote = (quote: Quote) => {
    copyQuoteMutation.mutate(quote.id);
  };

  const handleDeleteQuote = (quote: Quote) => {
    setQuoteToDelete(quote);
  };

  const handleDownloadQuote = async (quote: Quote) => {
    // Navigate to the quote page with a download flag
    window.location.href = `/quotes/${quote.id}?download=true`;
  };

  const confirmDeleteQuote = () => {
    if (quoteToDelete) {
      deleteQuoteMutation.mutate(quoteToDelete.id);
    }
  };

  const totalQuotes = quotes?.length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quote History</h1>
          <p className="text-slate-600 mt-1">View and manage all travel quotes</p>
        </div>
        <div className="flex gap-2">
          <Link href="/">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Quote
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Quotes</p>
              <p className="text-2xl font-bold text-slate-900">{totalQuotes}</p>
            </div>
            <QuoteIcon className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by school name, destination, quote number, or contact person..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by trip type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trip Types</SelectItem>
                  <SelectItem value="Work Experience Mobility">Work Experience Mobility</SelectItem>
                  <SelectItem value="Job Shadowing">Job Shadowing</SelectItem>
                  <SelectItem value="School Exchange">School Exchange</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm || filterBy !== "all") && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <span>
                Showing {filteredQuotes?.length || 0} of {totalQuotes} quotes
              </span>
              {(searchTerm || filterBy !== "all") && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterBy("all");
                  }}
                  className="h-auto p-0 text-primary"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading quotes...</div>
        ) : filteredQuotes && filteredQuotes.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto relative">
                <table className="w-full table-auto relative">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-3 font-medium text-slate-700 text-sm">Quote Number</th>
                      <th className="text-left p-3 font-medium text-slate-700 text-sm">School</th>
                      <th className="text-left p-3 font-medium text-slate-700 text-sm">Destination</th>
                      <th className="text-left p-3 font-medium text-slate-700 text-sm">Trip Type</th>
                      <th className="text-left p-3 font-medium text-slate-700 text-sm">Students Accommodation</th>
                      <th className="text-left p-3 font-medium text-slate-700 text-sm">Teachers Accommodation</th>
                      <th className="text-right p-3 font-medium text-slate-700 text-sm">Total</th>
                      <th className="text-right p-3 font-medium text-slate-700 text-sm">Net Profit</th>
                      <th className="text-right p-3 font-medium text-slate-700 text-sm">Per Person</th>
                      <th className="text-right p-3 font-medium text-slate-700 text-sm">Net Margin%</th>
                      <th className="actions-col sticky right-0 z-20 bg-white w-16 text-right p-3 font-medium text-slate-700 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.map((quote) => {
                      const { total, netProfit, averageProfitPerTraveller } = calculateQuoteProfitability(quote);
                      return (
                        <tr key={quote.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 whitespace-normal break-words">
                            <div className="font-medium text-primary text-sm flex items-center gap-2">
                              {quote.quoteNumber}
                              {quote.internalNotes && quote.internalNotes.trim() && (
                                <span className="inline-block w-2 h-2 bg-red-500 rounded-full" title="Has internal notes"></span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {format(new Date(quote.createdAt), "MMM d, yyyy")}
                            </div>
                          </td>
                          <td className="p-3 whitespace-normal break-words">
                            <div className="font-medium text-slate-900 text-sm">{quote.fiscalName}</div>
                            <div className="text-xs text-slate-500">{quote.email}</div>
                          </td>
                          <td className="p-3 whitespace-normal break-words">
                            <div className="font-medium text-slate-900 text-sm">{quote.destination}</div>
                            <div className="text-xs text-slate-500">
                              {quote.numberOfStudents}S / {quote.numberOfTeachers}T • {quote.duration}
                            </div>
                          </td>
                          <td className="p-3 whitespace-normal break-words">
                            <div className="text-sm text-slate-900 font-medium">{quote.tripType}</div>
                          </td>
                          <td className="p-3 whitespace-normal break-words">
                            <div className="text-sm text-slate-900">
                              {quote.studentAccommodationName || 'Not specified'}
                            </div>
                          </td>
                          <td className="p-3 whitespace-normal break-words">
                            <div className="text-sm text-slate-900">
                              {quote.teacherAccommodationName || 'Not specified'}
                            </div>
                          </td>
                          <td className="p-3 text-right whitespace-normal break-words">
                            <div className="font-semibold text-slate-900 text-sm">
                              €{Math.round(total).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-3 text-right whitespace-normal break-words">
                            <div className={`font-medium text-sm ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              €{Math.round(netProfit).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-3 text-right whitespace-normal break-words">
                            <div className={`font-medium text-sm ${averageProfitPerTraveller >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              €{Math.round(averageProfitPerTraveller).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-3 text-right whitespace-normal break-words">
                            <div className={`font-medium text-sm ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {total > 0 ? `${((netProfit / total) * 100).toFixed(1)}%` : '0.0%'}
                            </div>
                          </td>
                          <td className="actions-col sticky right-0 z-10 bg-white w-16 text-right p-3">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewQuote(quote)}
                                title="View Quote"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadQuote(quote)}
                                title="Download PDF"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyQuote(quote)}
                                disabled={copyQuoteMutation.isPending}
                                title="Copy Quote"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditQuote(quote)}
                                title="Edit Quote"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteQuote(quote)}
                                disabled={deleteQuoteMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                title="Delete Quote"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No quotes found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm || filterBy !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first travel quote."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Quote Dialog */}
      <Dialog open={!!viewingQuote} onOpenChange={() => setViewingQuote(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="quote-preview-content">
          <DialogHeader>
            <DialogTitle>Quote Details - {viewingQuote?.quoteNumber}</DialogTitle>
          </DialogHeader>
          {viewingQuote && (
            <div id="quote-preview-content" className="space-y-4">
              <QuotePreview quote={viewingQuote} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!quoteToDelete} onOpenChange={() => setQuoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete quote "{quoteToDelete?.quoteNumber}" for {quoteToDelete?.fiscalName}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteQuoteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteQuote}
              disabled={deleteQuoteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteQuoteMutation.isPending ? "Deleting..." : "Delete Quote"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}