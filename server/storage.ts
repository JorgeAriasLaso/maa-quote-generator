import { quotes, type Quote, type InsertQuote } from "@shared/schema";
import { db } from "./db";

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
      quoteNumber: insertQuote.quoteNumber || `TPQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      // Set defaults for custom pricing fields
      accommodationPerDay: insertQuote.accommodationPerDay || null,
      breakfastPerDay: insertQuote.breakfastPerDay || null,
      lunchPerDay: insertQuote.lunchPerDay || null,
      dinnerPerDay: insertQuote.dinnerPerDay || null,
      transportCardTotal: insertQuote.transportCardTotal || null,
      studentCoordinationFeeTotal: insertQuote.studentCoordinationFeeTotal || null,
      teacherCoordinationFeeTotal: insertQuote.teacherCoordinationFeeTotal || null,
      airportTransferPerPerson: insertQuote.airportTransferPerPerson || null,
      // Set defaults for boolean fields
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
      .values(insertQuote)
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
}

export const storage = new MemStorage();
