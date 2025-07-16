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
  const totalStudents = quotes?.reduce((sum, quote) => sum + quote.numberOfStudents, 0) || 0;
  const totalTeachers = quotes?.reduce((sum, quote) => sum + quote.numberOfTeachers, 0) || 0;

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Students</p>
                <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">S</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Teachers</p>
                <p className="text-2xl font-bold text-slate-900">{totalTeachers}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">T</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{quote.quoteNumber}</h3>
                      <p className="text-slate-600 font-medium">{quote.schoolName}</p>
                      <p className="text-sm text-slate-500">{quote.contactPerson}</p>
                    </div>
                    <div className="flex gap-2">
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
                  </div>
                  
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