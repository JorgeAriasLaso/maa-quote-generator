import { quotes, clients, type Quote, type InsertQuote, type Client, type InsertClient } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  // Quote operations
  getQuote(id: number): Promise<Quote | undefined>;
  getAllQuotes(): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;
  
  // Client operations
  getClient(id: number): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  getClientQuotes(clientId: number): Promise<Quote[]>;
}

export class MemStorage implements IStorage {
  private quotes: Map<number, Quote>;
  private clients: Map<number, Client>;
  private currentQuoteId: number;
  private currentClientId: number;

  constructor() {
    this.quotes = new Map();
    this.clients = new Map();
    this.currentQuoteId = 1;
    this.currentClientId = 1;
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async getAllQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.currentQuoteId++;
    const quote: Quote = {
      ...insertQuote,
      id,
      createdAt: new Date(),
      quoteNumber: `TPQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      // Set defaults for custom pricing fields - convert undefined to null
      studentAccommodationPerDay: insertQuote.studentAccommodationPerDay || null,
      teacherAccommodationPerDay: insertQuote.teacherAccommodationPerDay || null,
      breakfastPerDay: insertQuote.breakfastPerDay || null,
      lunchPerDay: insertQuote.lunchPerDay || null,
      dinnerPerDay: insertQuote.dinnerPerDay || null,
      transportCardTotal: insertQuote.transportCardTotal || null,
      studentCoordinationFeeTotal: insertQuote.studentCoordinationFeeTotal || null,
      teacherCoordinationFeeTotal: insertQuote.teacherCoordinationFeeTotal || null,
      airportTransferPerPerson: insertQuote.airportTransferPerPerson || null,
      // Set defaults for internal cost fields
      costStudentAccommodationPerDay: insertQuote.costStudentAccommodationPerDay || null,
      costTeacherAccommodationPerDay: insertQuote.costTeacherAccommodationPerDay || null,
      costBreakfastPerDay: insertQuote.costBreakfastPerDay || null,
      costLunchPerDay: insertQuote.costLunchPerDay || null,
      costDinnerPerDay: insertQuote.costDinnerPerDay || null,
      costLocalTransportationCard: insertQuote.costLocalTransportationCard || null,
      costStudentCoordination: insertQuote.costStudentCoordination || null,
      costTeacherCoordination: insertQuote.costTeacherCoordination || null,
      costLocalCoordinator: insertQuote.costLocalCoordinator || null,
      costAirportTransfer: insertQuote.costAirportTransfer || null,
      // Set defaults for adhoc services
      adhocServices: insertQuote.adhocServices || null,
      // Set clientId to null if undefined
      clientId: insertQuote.clientId || null,
    };
    this.quotes.set(id, quote);
    return quote;
  }

  async updateQuote(id: number, updateData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const existingQuote = this.quotes.get(id);
    if (!existingQuote) {
      return undefined;
    }

    const updatedQuote: Quote = {
      ...existingQuote,
      ...updateData,
    };

    this.quotes.set(id, updatedQuote);
    return updatedQuote;
  }

  async deleteQuote(id: number): Promise<boolean> {
    return this.quotes.delete(id);
  }

  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = {
      id,
      ...insertClient,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) {
      return undefined;
    }

    const updatedClient: Client = {
      ...existingClient,
      ...updateData,
      updatedAt: new Date(),
    };

    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  async getClientQuotes(clientId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values())
      .filter(quote => quote.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // db is imported at the top of the file
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    const { eq } = await import('drizzle-orm');
    
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }

  async getAllQuotes(): Promise<Quote[]> {
    const { desc } = await import('drizzle-orm');
    
    return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db
      .insert(quotes)
      .values({
        ...insertQuote,
        quoteNumber: `TPQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      })
      .returning();
    return quote;
  }

  async updateQuote(id: number, updateData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const { eq } = await import('drizzle-orm');
    
    const [quote] = await db
      .update(quotes)
      .set(updateData)
      .where(eq(quotes.id, id))
      .returning();
    return quote || undefined;
  }

  async deleteQuote(id: number): Promise<boolean> {
    const { eq } = await import('drizzle-orm');
    
    const result = await db
      .delete(quotes)
      .where(eq(quotes.id, id))
      .returning();
    return result.length > 0;
  }

  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    const { eq } = await import('drizzle-orm');
    
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getAllClients(): Promise<Client[]> {
    const { desc } = await import('drizzle-orm');
    
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values({
        ...insertClient,
        taxId: insertClient.taxId || null,
        email: insertClient.email || null,
        postcode: insertClient.postcode || null,
        address: insertClient.address || null,
      })
      .returning();
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const { eq } = await import('drizzle-orm');
    
    const [client] = await db
      .update(clients)
      .set({
        ...updateData,
        taxId: updateData.taxId || null,
        email: updateData.email || null,
        postcode: updateData.postcode || null,
        address: updateData.address || null,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const { eq } = await import('drizzle-orm');
    
    const result = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning();
    return result.length > 0;
  }

  async getClientQuotes(clientId: number): Promise<Quote[]> {
    const { eq, desc } = await import('drizzle-orm');
    
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.clientId, clientId))
      .orderBy(desc(quotes.createdAt));
  }
}

export const storage = new DatabaseStorage();
