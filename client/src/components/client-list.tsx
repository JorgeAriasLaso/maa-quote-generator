import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Client } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface ClientListProps {
  onEditClient?: (client: Client) => void;
  onViewQuotes?: (clientId: number) => void;
}

export function ClientList({ onEditClient, onViewQuotes }: ClientListProps) {
  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No clients yet</h3>
          <p className="text-slate-500 mb-4">Get started by creating your first client.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <Card key={client.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{client.schoolName}</CardTitle>
                <p className="text-slate-600 font-medium">{client.contactPerson}</p>
              </div>
              <div className="flex gap-2">
                {onEditClient && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClient(client)}
                  >
                    Edit
                  </Button>
                )}
                {onViewQuotes && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewQuotes(client.id)}
                  >
                    View Quotes
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${client.email}`} className="hover:underline">
                    {client.email}
                  </a>
                </div>
              )}
              
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${client.phone}`} className="hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
              
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{client.schoolAddress}</span>
              </div>
              
              {client.notes && (
                <div className="bg-slate-50 p-3 rounded-md mt-3">
                  <p className="text-sm text-slate-700">{client.notes}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                <Calendar className="h-3 w-3" />
                <span>Created {format(new Date(client.createdAt), "MMM d, yyyy")}</span>
                {client.updatedAt !== client.createdAt && (
                  <span>• Updated {format(new Date(client.updatedAt), "MMM d, yyyy")}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}