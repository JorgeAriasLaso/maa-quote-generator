import { quotes, type Quote, type InsertQuote } from "@shared/schema";

export interface IStorage {
  getQuote(id: number): Promise<Quote | undefined>;
  getAllQuotes(): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private quotes: Map<number, Quote>;
  private currentId: number;

  constructor() {
    this.quotes = new Map();
    this.currentId = 1;
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
    const id = this.currentId++;
    const quote: Quote = {
      ...insertQuote,
      id,
      createdAt: new Date(),
      travelInsurance: insertQuote.travelInsurance ?? false,
      airportTransfers: insertQuote.airportTransfers ?? false,
      localTransport: insertQuote.localTransport ?? false,
      tourGuide: insertQuote.tourGuide ?? false,
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
}

export const storage = new MemStorage();
