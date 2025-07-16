import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Client, type InsertClient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ClientForm } from "@/components/client-form";
import { ClientList } from "@/components/client-list";
import { CSVImport } from "@/components/csv-import";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Quote, Upload } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Clients() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingQuotes, setViewingQuotes] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsFormOpen(false);
    },
    onError: (error) => {
      console.error("Client creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertClient }) => {
      const response = await apiRequest("PATCH", `/api/clients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setEditingClient(null);
    },
    onError: (error) => {
      console.error("Client update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
    },
  });

  // Get client quotes
  const { data: clientQuotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["/api/clients", viewingQuotes, "quotes"],
    enabled: !!viewingQuotes,
  });

  const handleCreateClient = (data: InsertClient) => {
    createClientMutation.mutate(data);
  };

  const handleUpdateClient = (data: InsertClient) => {
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, data });
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
  };

  const handleViewQuotes = (clientId: number) => {
    setViewingQuotes(clientId);
  };

  const handleCreateQuote = (client: Client) => {
    // Store the client data in sessionStorage for the quote form
    sessionStorage.setItem('selectedClient', JSON.stringify(client));
    // Navigate to the home page (quote form)
    setLocation('/');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Client Management</h1>
          <p className="text-slate-600 mt-1">Manage your school clients and their quote history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList>
          <TabsTrigger value="clients">
            <Users className="w-4 h-4 mr-2" />
            All Clients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <ClientList
            onEditClient={handleEditClient}
            onViewQuotes={handleViewQuotes}
            onCreateQuote={handleCreateQuote}
          />
        </TabsContent>
      </Tabs>

      {/* Create Client Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="create-client-form">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>
          <div id="create-client-form">
            <ClientForm
              onSubmit={handleCreateClient}
              isLoading={createClientMutation.isPending}
              title=""
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-client-form">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <div id="edit-client-form">
              <ClientForm
                onSubmit={handleUpdateClient}
                isLoading={updateClientMutation.isPending}
                initialData={editingClient}
                title=""
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Client Quotes Dialog */}
      <Dialog open={!!viewingQuotes} onOpenChange={() => setViewingQuotes(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="client-quotes-list">
          <DialogHeader>
            <DialogTitle>Quote History</DialogTitle>
          </DialogHeader>
          <div id="client-quotes-list" className="space-y-4">
            {quotesLoading ? (
              <div className="text-center py-8">Loading quotes...</div>
            ) : !clientQuotes || clientQuotes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No quotes found for this client
              </div>
            ) : (
              <div className="space-y-3">
                {clientQuotes.map((quote: any) => (
                  <Card key={quote.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{quote.quoteNumber}</h4>
                          <p className="text-sm text-slate-600">
                            {quote.destination} • {quote.duration} • {quote.numberOfStudents} students, {quote.numberOfTeachers} teachers
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">€{quote.pricePerStudent}/student</p>
                          <p className="text-sm text-slate-600">€{quote.pricePerTeacher}/teacher</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="csv-import-content">
          <DialogHeader>
            <DialogTitle>Import Clients from CSV</DialogTitle>
          </DialogHeader>
          <div id="csv-import-content">
            <CSVImport onClose={() => setIsImportOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}