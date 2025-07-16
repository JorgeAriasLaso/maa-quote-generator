import type { Quote } from "./schema";

// Base pricing configuration by destination country
export const DESTINATION_PRICING = {
  // Central/Eastern Europe - Lower cost
  "Czech Republic": { basePrice: 65, teacherDiscount: 0.8 },
  "Hungary": { basePrice: 60, teacherDiscount: 0.8 },
  "Poland": { basePrice: 58, teacherDiscount: 0.8 },
  
  // Western Europe - Medium cost
  "Denmark": { basePrice: 85, teacherDiscount: 0.7 },
  "Portugal": { basePrice: 70, teacherDiscount: 0.75 },
  "Spain": { basePrice: 75, teacherDiscount: 0.75 },
  
  // Premium destinations - Higher cost
  "France": { basePrice: 90, teacherDiscount: 0.7 },
  "Italy": { basePrice: 88, teacherDiscount: 0.7 },
  "United Kingdom": { basePrice: 95, teacherDiscount: 0.65 },
  "UK": { basePrice: 95, teacherDiscount: 0.65 },
} as const;

// Additional services pricing
export const ADDITIONAL_SERVICES = {
  travelInsurance: { perPerson: 15, description: "Comprehensive travel insurance" },
  airportTransfers: { total: 120, description: "Round-trip airport transfers" },
  localTransport: { perPerson: 25, description: "Local transport pass" },
  tourGuide: { perDay: 80, description: "Professional tour guide" },
} as const;

// Group size discounts
export const GROUP_DISCOUNTS = [
  { minSize: 30, discount: 0.05, description: "5% discount for groups of 30+" },
  { minSize: 40, discount: 0.08, description: "8% discount for groups of 40+" },
  { minSize: 50, discount: 0.12, description: "12% discount for groups of 50+" },
] as const;

// Duration multipliers
export const DURATION_PRICING = {
  1: 1.0,
  2: 1.8,
  3: 2.5,
  4: 3.2,
  5: 3.8,
  6: 4.4,
  7: 5.0,
  8: 5.5,
  9: 6.0,
  10: 6.4,
  11: 6.8,
  12: 7.2,
  13: 7.5,
  14: 7.8,
} as const;

export interface CostBreakdown {
  baseStudentCost: number;
  baseCostPerStudent: number;
  teacherCost: number;
  baseCostPerTeacher: number;
  additionalServices: {
    travelInsurance: number;
    airportTransfers: number;
    localTransport: number;
    tourGuide: number;
    total: number;
  };
  groupDiscount: {
    percentage: number;
    amount: number;
    description: string;
  } | null;
  subtotal: number;
  total: number;
  pricePerStudent: number;
  pricePerTeacher: number;
}

function getCountryFromDestination(destination: string): string {
  const destination_lower = destination.toLowerCase();
  
  if (destination_lower.includes('prague') || destination_lower.includes('czech')) return "Czech Republic";
  if (destination_lower.includes('budapest') || destination_lower.includes('hungary')) return "Hungary";
  if (destination_lower.includes('krakow') || destination_lower.includes('warsaw') || destination_lower.includes('poland')) return "Poland";
  if (destination_lower.includes('copenhagen') || destination_lower.includes('denmark')) return "Denmark";
  if (destination_lower.includes('porto') || destination_lower.includes('lisbon') || destination_lower.includes('portugal')) return "Portugal";
  if (destination_lower.includes('barcelona') || destination_lower.includes('madrid') || destination_lower.includes('valencia') || destination_lower.includes('seville') || destination_lower.includes('bilbao') || destination_lower.includes('gijon') || destination_lower.includes('spain')) return "Spain";
  if (destination_lower.includes('paris') || destination_lower.includes('lyon') || destination_lower.includes('france')) return "France";
  if (destination_lower.includes('rome') || destination_lower.includes('milan') || destination_lower.includes('florence') || destination_lower.includes('venice') || destination_lower.includes('naples') || destination_lower.includes('bari') || destination_lower.includes('catania') || destination_lower.includes('italy')) return "Italy";
  if (destination_lower.includes('london') || destination_lower.includes('bristol') || destination_lower.includes('uk') || destination_lower.includes('united kingdom') || destination_lower.includes('britain')) return "United Kingdom";
  
  // Default to medium pricing for unknown destinations
  return "Spain";
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 7;
}

export function calculateQuoteCost(
  destination: string,
  duration: string,
  numberOfStudents: number,
  numberOfTeachers: number,
  services: {
    travelInsurance: boolean;
    airportTransfers: boolean;
    localTransport: boolean;
    tourGuide: boolean;
  }
): CostBreakdown {
  const country = getCountryFromDestination(destination);
  const pricing = DESTINATION_PRICING[country] || DESTINATION_PRICING["Spain"];
  const days = parseDuration(duration);
  
  // Get duration multiplier
  const durationMultiplier = DURATION_PRICING[days as keyof typeof DURATION_PRICING] || 
    (days <= 14 ? days * 0.5 + 0.5 : 8.0);
  
  // Calculate base costs
  const baseCostPerStudent = pricing.basePrice * durationMultiplier;
  const baseCostPerTeacher = baseCostPerStudent * pricing.teacherDiscount;
  
  const baseStudentCost = baseCostPerStudent * numberOfStudents;
  const teacherCost = baseCostPerTeacher * numberOfTeachers;
  
  // Calculate additional services
  const additionalServices = {
    travelInsurance: services.travelInsurance ? 
      ADDITIONAL_SERVICES.travelInsurance.perPerson * (numberOfStudents + numberOfTeachers) : 0,
    airportTransfers: services.airportTransfers ? ADDITIONAL_SERVICES.airportTransfers.total : 0,
    localTransport: services.localTransport ? 
      ADDITIONAL_SERVICES.localTransport.perPerson * (numberOfStudents + numberOfTeachers) : 0,
    tourGuide: services.tourGuide ? ADDITIONAL_SERVICES.tourGuide.perDay * days : 0,
    total: 0,
  };
  
  additionalServices.total = additionalServices.travelInsurance + 
    additionalServices.airportTransfers + 
    additionalServices.localTransport + 
    additionalServices.tourGuide;
  
  // Calculate subtotal before discounts
  const subtotal = baseStudentCost + teacherCost + additionalServices.total;
  
  // Apply group discounts
  const totalParticipants = numberOfStudents + numberOfTeachers;
  let groupDiscount: CostBreakdown["groupDiscount"] = null;
  
  for (const discount of GROUP_DISCOUNTS.slice().reverse()) {
    if (totalParticipants >= discount.minSize) {
      const discountAmount = subtotal * discount.discount;
      groupDiscount = {
        percentage: discount.discount * 100,
        amount: discountAmount,
        description: discount.description,
      };
      break;
    }
  }
  
  const total = subtotal - (groupDiscount?.amount || 0);
  
  return {
    baseStudentCost,
    baseCostPerStudent,
    teacherCost,
    baseCostPerTeacher,
    additionalServices,
    groupDiscount,
    subtotal,
    total,
    pricePerStudent: Math.round(baseCostPerStudent),
    pricePerTeacher: Math.round(baseCostPerTeacher),
  };
}

export function formatCurrency(amount: number): string {
  return `€${Math.round(amount).toLocaleString()}`;
}