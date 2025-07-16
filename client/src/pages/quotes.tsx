import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Quote } from "@shared/schema";
import { QuoteList } from "@/components/quote-list";
import { QuotePreview } from "@/components/quote-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Quote as QuoteIcon, Search, Filter, Download, MapPin, Calendar, Users, GraduationCap, Eye, FileText } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Quotes() {
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const { data: quotes, isLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  // Filter quotes based on search term and filter type
  const filteredQuotes = quotes?.filter(quote => {
    const matchesSearch = searchTerm === "" || 
      quote.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterBy === "all" || quote.tripType === filterBy;

    return matchesSearch && matchesFilter;
  });

  const handleViewQuote = (quote: Quote) => {
    setViewingQuote(quote);
  };

  const handleEditQuote = (quote: Quote) => {
    // Navigate to home with quote data (we could implement this later)
    window.location.href = `/?edit=${quote.id}`;
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
          <Link href="/clients">
            <Button variant="outline">
              Client Management
            </Button>
          </Link>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-slate-700">Quote Number</th>
                      <th className="text-left p-4 font-medium text-slate-700">School</th>
                      <th className="text-left p-4 font-medium text-slate-700">Destination</th>
                      <th className="text-left p-4 font-medium text-slate-700">Total</th>
                      <th className="text-left p-4 font-medium text-slate-700">Date</th>
                      <th className="text-right p-4 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.map((quote) => {
                      const totalCost = (parseFloat(quote.pricePerStudent) * quote.numberOfStudents) + 
                                       (parseFloat(quote.pricePerTeacher) * quote.numberOfTeachers);
                      return (
                        <tr key={quote.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4">
                            <div className="font-medium text-primary">{quote.quoteNumber}</div>
                            <div className="text-sm text-slate-500">{quote.tripType}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-slate-900">{quote.schoolName}</div>
                            <div className="text-sm text-slate-500">{quote.contactPerson}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-slate-900">{quote.destination}</div>
                            <div className="text-sm text-slate-500">
                              {quote.numberOfStudents} students, {quote.numberOfTeachers} teachers
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-lg text-slate-900">
                              €{totalCost.toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-500">{quote.duration}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-slate-700">
                              {format(new Date(quote.createdAt), "MMM d, yyyy")}
                            </div>
                            <div className="text-xs text-slate-500">
                              {format(new Date(quote.createdAt), "HH:mm")}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewQuote(quote)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditQuote(quote)}
                              >
                                Edit
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
    </div>
  );
}