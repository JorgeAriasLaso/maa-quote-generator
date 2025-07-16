import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Client, type InsertClient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ClientForm } from "@/components/client-form";
import { ClientList } from "@/components/client-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Quote } from "lucide-react";
import { Link } from "wouter";

export default function Clients() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingQuotes, setViewingQuotes] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      return apiRequest("/api/clients", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertClient }) => {
      return apiRequest(`/api/clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setEditingClient(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update client",
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Client Management</h1>
          <p className="text-slate-600 mt-1">Manage your school clients and their quote history</p>
        </div>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline">
              <Quote className="w-4 h-4 mr-2" />
              Back to Quotes
            </Button>
          </Link>
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
    </div>
  );
}