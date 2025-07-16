import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  destination: text("destination").notNull(),
  tripType: text("trip_type").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  duration: text("duration").notNull(),
  numberOfStudents: integer("number_of_students").notNull(),
  numberOfTeachers: integer("number_of_teachers").notNull(),
  schoolName: text("school_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  schoolStreet: text("school_street").notNull(),
  schoolCity: text("school_city").notNull(),
  schoolPostcode: text("school_postcode").notNull(),
  schoolCountry: text("school_country").notNull(),
  pricePerStudent: decimal("price_per_student", { precision: 10, scale: 2 }).notNull(),
  pricePerTeacher: text("price_per_teacher").notNull(),
  travelInsurance: boolean("travel_insurance").default(false),
  airportTransfers: boolean("airport_transfers").default(false),
  localTransport: boolean("local_transport").default(false),
  tourGuide: boolean("tour_guide").default(false),
  quoteNumber: text("quote_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
