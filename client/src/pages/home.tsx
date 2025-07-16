import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { QuoteForm } from "@/components/quote-form";
import { QuotePreview } from "@/components/quote-preview";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type InsertQuote, type Quote, type Client } from "@shared/schema";
import { calculateQuoteCost } from "@shared/costing";
import logoPath from "@assets/Main Brand Logo_1752655471601.png";

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [liveCostBreakdown, setLiveCostBreakdown] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editQuoteId, setEditQuoteId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for edit parameter in URL and selected client from sessionStorage
  useEffect(() => {
    // Check for edit parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      const id = parseInt(editId);
      if (!isNaN(id)) {
        setEditQuoteId(id);
      }
    }

    // Check for selected client from sessionStorage on component mount
    const storedClient = sessionStorage.getItem('selectedClient');
    if (storedClient) {
      try {
        const client = JSON.parse(storedClient);
        setSelectedClient(client);
        // Clear the stored client so it doesn't persist
        sessionStorage.removeItem('selectedClient');
      } catch (e) {
        console.error('Error parsing selected client from sessionStorage:', e);
      }
    }
  }, []);

  // Load quote data when editing
  const { data: quoteToEdit, isLoading: isLoadingQuote } = useQuery({
    queryKey: ["/api/quotes", editQuoteId],
    queryFn: async () => {
      if (!editQuoteId) return null;
      const response = await apiRequest("GET", `/api/quotes/${editQuoteId}`);
      return response.json();
    },
    enabled: !!editQuoteId,
  });

  // Set current quote when quote data is loaded
  useEffect(() => {
    if (quoteToEdit) {
      setCurrentQuote(quoteToEdit);
    }
  }, [quoteToEdit]);

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
          costAirportTransfer: parseFloat(data.costAirportTransfer || "0"),
        }
      );

      const finalData = {
        ...data,
        pricePerStudent: costBreakdown.pricePerStudent.toString(),
        pricePerTeacher: costBreakdown.pricePerTeacher.toString(),
      };

      // If we have a current quote or editing an existing quote, update it; otherwise create new one
      if (currentQuote || editQuoteId) {
        const quoteId = currentQuote?.id || editQuoteId;
        const response = await apiRequest("PATCH", `/api/quotes/${quoteId}`, finalData);
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
        title: (currentQuote || editQuoteId) ? "Quote Updated Successfully" : "Quote Generated Successfully",
        description: (currentQuote || editQuoteId) 
          ? `Quote ${updatedQuote.quoteNumber} has been updated with your latest changes.`
          : `Quote ${updatedQuote.quoteNumber} has been created and is ready for review.`,
      });
    },
    onError: (error) => {
      toast({
        title: (currentQuote || editQuoteId) ? "Error Updating Quote" : "Error Creating Quote",
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
        {/* Left Panel - Quote Builder Form */}
        <QuoteForm 
          onSubmit={handleFormSubmit} 
          isLoading={saveQuoteMutation.isPending}
          onCostBreakdownChange={setLiveCostBreakdown}
          currentQuote={currentQuote}
          selectedClient={selectedClient}
        />

        {/* Right Panel - Quote Preview */}
        <QuotePreview 
          quote={currentQuote} 
          costBreakdown={currentQuote ? undefined : liveCostBreakdown} 
        />
      </div>
    </div>
  );
}
