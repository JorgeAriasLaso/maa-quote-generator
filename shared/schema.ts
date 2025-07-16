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
  schoolAddress: text("school_address").notNull(),
  
  // Custom pricing inputs - daily rates
  studentAccommodationPerDay: text("student_accommodation_per_day"),
  teacherAccommodationPerDay: text("teacher_accommodation_per_day"),
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
  
  quoteNumber: text("quote_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  quoteNumber: true,
}).extend({
  costStudentAccommodationPerDay: z.string().optional(),
  costTeacherAccommodationPerDay: z.string().optional(),
  costBreakfastPerDay: z.string().optional(),
  costLunchPerDay: z.string().optional(),
  costDinnerPerDay: z.string().optional(),
  costLocalTransportationCard: z.string().optional(),
  costStudentCoordination: z.string().optional(),
  costTeacherCoordination: z.string().optional(),
  costLocalCoordinator: z.string().optional(),
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
