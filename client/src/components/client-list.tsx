import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Client } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, MapPin, FileText, Edit, Eye, Search, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ClientListProps {
  onEditClient?: (client: Client) => void;
  onViewQuotes?: (clientId: number) => void;
  onCreateQuote?: (client: Client) => void;
  onDeleteClient?: (client: Client) => void;
}

export function ClientList({ onEditClient, onViewQuotes, onCreateQuote, onDeleteClient }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Filter and sort clients based on search term
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    
    let filtered = clients;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = clients.filter(client => 
        client.fiscalName.toLowerCase().includes(search) ||
        client.country.toLowerCase().includes(search) ||
        client.city.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.taxId?.toLowerCase().includes(search)
      );
    }
    
    // Sort alphabetically by school name
    return filtered.sort((a, b) => 
      a.fiscalName.localeCompare(b.fiscalName, undefined, { sensitivity: 'base' })
    );
  }, [clients, searchTerm]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search clients by name, country, city, email or tax ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No clients yet</h3>
            <p className="text-slate-500 mb-4">Get started by creating your first client.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search clients by name, country, city, email or tax ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-slate-600">
        <span>
          {filteredClients.length} of {clients.length} clients
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
      </div>

      {/* Client Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Client Name</TableHead>
                <TableHead className="w-[15%]">Country</TableHead>
                <TableHead className="w-[25%]">Email</TableHead>
                <TableHead className="w-[15%]">City</TableHead>
                <TableHead className="w-[15%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    {searchTerm ? `No clients found matching "${searchTerm}"` : "No clients found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold text-slate-900">{client.fiscalName}</div>
                        {client.taxId && (
                          <div className="text-sm text-slate-500">Tax ID: {client.taxId}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{client.country}</TableCell>
                    <TableCell>
                      {client.email ? (
                        <a 
                          href={`mailto:${client.email}`} 
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Mail className="h-4 w-4" />
                          {client.email}
                        </a>
                      ) : (
                        <span className="text-slate-400">No email</span>
                      )}
                    </TableCell>
                    <TableCell>{client.city}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {onEditClient && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditClient(client)}
                            className="h-8 w-8 p-0"
                            title="Edit client"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onViewQuotes && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewQuotes(client.id)}
                            className="h-8 w-8 p-0"
                            title="View quotes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onCreateQuote && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCreateQuote(client)}
                            className="h-8 w-8 p-0"
                            title="Create new quote"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        {onDeleteClient && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteClient(client)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete client"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}