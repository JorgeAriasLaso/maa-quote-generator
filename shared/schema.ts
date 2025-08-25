import { pgTable, text, varchar, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Clients table for client management
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  fiscalName: text("fiscal_name").notNull(),
  taxId: text("tax_id"), // Optional
  email: text("email"), // Optional
  country: text("country").notNull(),
  city: text("city").notNull(),
  postcode: text("postcode"), // Optional
  address: text("address"), // Optional
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  destination: text("destination").notNull(),
  tripType: text("trip_type").notNull(),
  customTripType: text("custom_trip_type"), // For when tripType is "Other"
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  duration: text("duration").notNull(),
  numberOfStudents: integer("number_of_students").notNull(),
  numberOfTeachers: integer("number_of_teachers").notNull(),
  
  // Client information (matching client database structure)
  fiscalName: text("fiscal_name").notNull(),
  taxId: text("tax_id"),
  email: text("email"),
  country: text("country").notNull(),
  city: text("city").notNull(),
  postcode: text("postcode"),
  address: text("address"),
  
  // Custom pricing inputs - daily rates
  studentAccommodationPerDay: text("student_accommodation_per_day"),
  teacherAccommodationPerDay: text("teacher_accommodation_per_day"),
  // Accommodation details - separate for students and teachers
  studentAccommodationName: text("student_accommodation_name"),
  teacherAccommodationName: text("teacher_accommodation_name"),
  additionalComments: text("additional_comments"),
  breakfastPerDay: text("breakfast_per_day"),
  lunchPerDay: text("lunch_per_day"),
  dinnerPerDay: text("dinner_per_day"),
  
  // Custom pricing inputs - total trip amounts
  transportCardTotal: text("transport_card_total"),
  studentCoordinationFeeTotal: text("student_coordination_fee_total"),
  teacherCoordinationFeeTotal: text("teacher_coordination_fee_total"),
  airportTransferPerPerson: text("airport_transfer_per_person"),
  
  // Calculated pricing (auto-generated)
  pricePerStudent: decimal("price_per_student", { precision: 10, scale: 2 }).notNull(),
  pricePerTeacher: text("price_per_teacher").notNull(),
  
  // Custom adhoc services (JSON array of {name: string, pricePerPerson: number})
  adhocServices: text("adhoc_services"),
  
  // Internal cost tracking for profitability analysis
  costStudentAccommodationPerDay: text("cost_student_accommodation_per_day"),
  costTeacherAccommodationPerDay: text("cost_teacher_accommodation_per_day"),
  costBreakfastPerDay: text("cost_breakfast_per_day"),
  costLunchPerDay: text("cost_lunch_per_day"),
  costDinnerPerDay: text("cost_dinner_per_day"),
  costLocalTransportationCard: text("cost_local_transportation_card"),
  costStudentCoordination: text("cost_student_coordination").default("60"),
  costTeacherCoordination: text("cost_teacher_coordination").default("0"),
  costLocalCoordinator: text("cost_local_coordinator").default("150"),
  costAirportTransfer: text("cost_airport_transfer"),
  
  // Internal notes (not shown to clients)
  internalNotes: text("internal_notes"),
  
  quoteNumber: text("quote_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  quoteNumber: true,
}).extend({
  customTripType: z.string().optional(),
  studentAccommodationName: z.string().optional(),
  teacherAccommodationName: z.string().optional(),
  additionalComments: z.string().optional(),
  costStudentAccommodationPerDay: z.string().optional(),
  costTeacherAccommodationPerDay: z.string().optional(),
  costBreakfastPerDay: z.string().optional(),
  costLunchPerDay: z.string().optional(),
  costDinnerPerDay: z.string().optional(),
  costLocalTransportationCard: z.string().optional(),
  costStudentCoordination: z.string().optional(),
  costTeacherCoordination: z.string().optional(),
  costLocalCoordinator: z.string().optional(),
  costAirportTransfer: z.string().optional(),
  internalNotes: z.string().optional(),
});

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  client: one(clients, {
    fields: [quotes.clientId],
    references: [clients.id],
  }),
}));

// Client schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  taxId: z.string().optional(),
  email: z.string().email().or(z.literal("")).optional(),
  postcode: z.string().optional(),
  address: z.string().optional(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

// Quote schemas
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
