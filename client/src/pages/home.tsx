import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QuoteForm } from "@/components/quote-form";
import { QuotePreview } from "@/components/quote-preview";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type InsertQuote, type Quote } from "@shared/schema";
import { calculateQuoteCost } from "@shared/costing";
import logoPath from "@assets/Main Brand Logo_1752655471601.png";

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [liveCostBreakdown, setLiveCostBreakdown] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveQuoteMutation = useMutation({
    mutationFn: async (data: InsertQuote) => {
      // Parse adhoc services if they exist
      let adhocServices = [];
      if (data.adhocServices) {
        try {
          adhocServices = JSON.parse(data.adhocServices);
        } catch (e) {
          adhocServices = [];
        }
      }

      // Calculate cost with new adhoc services
      const costBreakdown = calculateQuoteCost(
        data.destination,
        data.duration,
        data.numberOfStudents,
        data.numberOfTeachers,
        adhocServices,
        {
          studentAccommodationPerDay: parseFloat(data.studentAccommodationPerDay || "0"),
          teacherAccommodationPerDay: parseFloat(data.teacherAccommodationPerDay || "0"),
          breakfastPerDay: parseFloat(data.breakfastPerDay || "0"),
          lunchPerDay: parseFloat(data.lunchPerDay || "0"),
          dinnerPerDay: parseFloat(data.dinnerPerDay || "0"),
          transportCardTotal: parseFloat(data.transportCardTotal || "0"),
          studentCoordinationFeeTotal: parseFloat(data.studentCoordinationFeeTotal || "0"),
          teacherCoordinationFeeTotal: parseFloat(data.teacherCoordinationFeeTotal || "0"),
          airportTransferPerPerson: parseFloat(data.airportTransferPerPerson || "0"),
        },
        {
          costStudentAccommodationPerDay: parseFloat(data.costStudentAccommodationPerDay || "0"),
          costTeacherAccommodationPerDay: parseFloat(data.costTeacherAccommodationPerDay || "0"),
          costBreakfastPerDay: parseFloat(data.costBreakfastPerDay || "0"),
          costLunchPerDay: parseFloat(data.costLunchPerDay || "0"),
          costDinnerPerDay: parseFloat(data.costDinnerPerDay || "0"),
          costLocalTransportationCard: parseFloat(data.costLocalTransportationCard || "0"),
          costStudentCoordination: parseFloat(data.costStudentCoordination || "60"),
          costTeacherCoordination: parseFloat(data.costTeacherCoordination || "0"),
          costLocalCoordinator: parseFloat(data.costLocalCoordinator || "150"),
          costAirportTransfer: data.costAirportTransfer || "0",
        }
      );

      const finalData = {
        ...data,
        pricePerStudent: costBreakdown.pricePerStudent.toString(),
        pricePerTeacher: costBreakdown.pricePerTeacher.toString(),
      };

      // If we have a current quote, update it; otherwise create new one
      if (currentQuote) {
        const response = await apiRequest("PUT", `/api/quotes/${currentQuote.id}`, finalData);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/quotes", finalData);
        return response.json();
      }
    },
    onSuccess: (updatedQuote: Quote) => {
      setCurrentQuote(updatedQuote);
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: currentQuote ? "Quote Updated Successfully" : "Quote Generated Successfully",
        description: currentQuote 
          ? `Quote ${updatedQuote.quoteNumber} has been updated with your latest changes.`
          : `Quote ${updatedQuote.quoteNumber} has been created and is ready for review.`,
      });
    },
    onError: (error) => {
      toast({
        title: currentQuote ? "Error Updating Quote" : "Error Creating Quote",
        description: "There was an issue with your quote. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to save quote:", error);
    },
  });

  const handleFormSubmit = (data: InsertQuote) => {
    saveQuoteMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={logoPath} 
                alt="My Abroad Ally" 
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-xl font-semibold text-slate-900">My Abroad Ally</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-primary font-medium">Quote Generator</a>
              <a href="#" className="text-slate-600 hover:text-slate-900">Templates</a>
              <a href="#" className="text-slate-600 hover:text-slate-900">History</a>
              <a href="#" className="text-slate-600 hover:text-slate-900">Settings</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
          {/* Left Panel - Quote Builder Form */}
          <QuoteForm 
            onSubmit={handleFormSubmit} 
            isLoading={saveQuoteMutation.isPending}
            onCostBreakdownChange={setLiveCostBreakdown}
            currentQuote={currentQuote}
          />

          {/* Right Panel - Quote Preview */}
          <QuotePreview 
            quote={currentQuote} 
            costBreakdown={currentQuote ? undefined : liveCostBreakdown} 
          />
        </div>
      </div>
    </div>
  );
}
