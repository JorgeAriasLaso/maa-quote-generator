import type { Quote } from "./schema";

// Detailed cost breakdown by destination - per student per day
export const DESTINATION_PRICING = {
  // Central/Eastern Europe - Lower cost
  "Czech Republic": {
    accommodation: 25,
    breakfast: 8,
    lunch: 12,
    dinner: 15,
    transportCard: 3,
    coordinationFee: 7,
    teacherDiscount: 0.8,
  },
  "Hungary": {
    accommodation: 22,
    breakfast: 7,
    lunch: 10,
    dinner: 13,
    transportCard: 2.5,
    coordinationFee: 6,
    teacherDiscount: 0.8,
  },
  "Poland": {
    accommodation: 20,
    breakfast: 6,
    lunch: 9,
    dinner: 12,
    transportCard: 2,
    coordinationFee: 6,
    teacherDiscount: 0.8,
  },
  
  // Western Europe - Medium cost
  "Denmark": {
    accommodation: 45,
    breakfast: 15,
    lunch: 20,
    dinner: 25,
    transportCard: 5,
    coordinationFee: 10,
    teacherDiscount: 0.7,
  },
  "Portugal": {
    accommodation: 30,
    breakfast: 10,
    lunch: 15,
    dinner: 18,
    transportCard: 3,
    coordinationFee: 8,
    teacherDiscount: 0.75,
  },
  "Spain": {
    accommodation: 35,
    breakfast: 12,
    lunch: 16,
    dinner: 20,
    transportCard: 4,
    coordinationFee: 8,
    teacherDiscount: 0.75,
  },
  
  // Premium destinations - Higher cost
  "France": {
    accommodation: 50,
    breakfast: 18,
    lunch: 22,
    dinner: 28,
    transportCard: 6,
    coordinationFee: 12,
    teacherDiscount: 0.7,
  },
  "Italy": {
    accommodation: 45,
    breakfast: 15,
    lunch: 20,
    dinner: 25,
    transportCard: 5,
    coordinationFee: 10,
    teacherDiscount: 0.7,
  },
  "United Kingdom": {
    accommodation: 55,
    breakfast: 20,
    lunch: 25,
    dinner: 30,
    transportCard: 7,
    coordinationFee: 15,
    teacherDiscount: 0.65,
  },
  "UK": {
    accommodation: 55,
    breakfast: 20,
    lunch: 25,
    dinner: 30,
    transportCard: 7,
    coordinationFee: 15,
    teacherDiscount: 0.65,
  },
} as const;

// Airport transfer pricing by destination
export const AIRPORT_TRANSFER_PRICING = {
  "Czech Republic": 30,
  "Hungary": 25,
  "Poland": 22,
  "Denmark": 45,
  "Portugal": 35,
  "Spain": 40,
  "France": 50,
  "Italy": 45,
  "United Kingdom": 55,
  "UK": 55,
} as const;

// Additional services pricing
export const ADDITIONAL_SERVICES = {
  travelInsurance: { perPerson: 15, description: "Comprehensive travel insurance" },
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
  student: {
    accommodation: number;
    meals: number; // breakfast + lunch + dinner
    transportCard: number;
    coordinationFee: number;
    airportTransfer: number;
    totalPerStudent: number;
    totalForAllStudents: number;
  };
  teacher: {
    accommodation: number;
    meals: number; // breakfast + lunch + dinner
    transportCard: number;
    coordinationFee: number;
    airportTransfer: number;
    totalPerTeacher: number;
    totalForAllTeachers: number;
  };
  additionalServices: {
    travelInsurance: number;
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
  },
  customPricing?: {
    studentAccommodationPerDay?: number;
    teacherAccommodationPerDay?: number;
    breakfastPerDay?: number;
    lunchPerDay?: number;
    dinnerPerDay?: number;
    transportCardTotal?: number;
    studentCoordinationFeeTotal?: number;
    teacherCoordinationFeeTotal?: number;
    airportTransferPerPerson?: number;
  }
): CostBreakdown {
  const country = getCountryFromDestination(destination);
  const defaultPricing = DESTINATION_PRICING[country] || DESTINATION_PRICING["Spain"];
  const defaultAirportTransferRate = AIRPORT_TRANSFER_PRICING[country] || AIRPORT_TRANSFER_PRICING["Spain"];
  const days = parseDuration(duration);
  
  // Use custom pricing if provided, otherwise use zero
  const studentAccommodationRate = customPricing?.studentAccommodationPerDay ?? 0;
  const teacherAccommodationRate = customPricing?.teacherAccommodationPerDay ?? 0;
  const breakfastRate = customPricing?.breakfastPerDay ?? 0;
  const lunchRate = customPricing?.lunchPerDay ?? 0;
  const dinnerRate = customPricing?.dinnerPerDay ?? 0;
  const transportCardTotal = customPricing?.transportCardTotal ?? 0;
  const studentCoordinationTotal = customPricing?.studentCoordinationFeeTotal ?? 0;
  const teacherCoordinationTotal = customPricing?.teacherCoordinationFeeTotal ?? 0;
  const airportTransferRate = customPricing?.airportTransferPerPerson ?? 0;
  
  // Calculate student costs
  const studentAccommodation = studentAccommodationRate * days * numberOfStudents;
  const studentMeals = (breakfastRate + lunchRate + dinnerRate) * days * numberOfStudents;
  const studentTransportCard = transportCardTotal * numberOfStudents;
  const studentCoordinationFee = studentCoordinationTotal * numberOfStudents;
  const studentAirportTransfer = services.airportTransfers ? airportTransferRate * numberOfStudents : 0;
  
  const studentTotalPerStudent = (studentAccommodationRate + breakfastRate + lunchRate + 
    dinnerRate) * days + transportCardTotal + studentCoordinationTotal + 
    (services.airportTransfers ? airportTransferRate : 0);
  const studentTotalForAll = studentAccommodation + studentMeals + studentTransportCard + 
    studentCoordinationFee + studentAirportTransfer;
  
  // Calculate teacher costs (use separate accommodation rate, discount on meals only)
  const teacherAccommodation = teacherAccommodationRate * days * numberOfTeachers;
  const teacherMeals = (breakfastRate + lunchRate + dinnerRate) * defaultPricing.teacherDiscount * days * numberOfTeachers;
  const teacherTransportCard = transportCardTotal * numberOfTeachers;
  const teacherCoordinationFee = teacherCoordinationTotal * numberOfTeachers;
  const teacherAirportTransfer = services.airportTransfers ? airportTransferRate * numberOfTeachers : 0;
  
  const teacherTotalPerTeacher = (teacherAccommodationRate + (breakfastRate + lunchRate + 
    dinnerRate) * defaultPricing.teacherDiscount) * days + transportCardTotal + teacherCoordinationTotal + 
    (services.airportTransfers ? airportTransferRate : 0);
  const teacherTotalForAll = teacherAccommodation + teacherMeals + teacherTransportCard + 
    teacherCoordinationFee + teacherAirportTransfer;
  
  // Calculate additional services
  const additionalServices = {
    travelInsurance: services.travelInsurance ? 
      ADDITIONAL_SERVICES.travelInsurance.perPerson * (numberOfStudents + numberOfTeachers) : 0,
    tourGuide: services.tourGuide ? ADDITIONAL_SERVICES.tourGuide.perDay * days : 0,
    total: 0,
  };
  
  additionalServices.total = additionalServices.travelInsurance + additionalServices.tourGuide;
  
  // Calculate subtotal before discounts
  const subtotal = studentTotalForAll + teacherTotalForAll + additionalServices.total;
  
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
    student: {
      accommodation: studentAccommodation,
      meals: studentMeals,
      transportCard: studentTransportCard,
      coordinationFee: studentCoordinationFee,
      airportTransfer: studentAirportTransfer,
      totalPerStudent: Math.round(studentTotalPerStudent),
      totalForAllStudents: studentTotalForAll,
    },
    teacher: {
      accommodation: teacherAccommodation,
      meals: teacherMeals,
      transportCard: teacherTransportCard,
      coordinationFee: teacherCoordinationFee,
      airportTransfer: teacherAirportTransfer,
      totalPerTeacher: Math.round(teacherTotalPerTeacher),
      totalForAllTeachers: teacherTotalForAll,
    },
    additionalServices,
    groupDiscount,
    subtotal,
    total,
    pricePerStudent: Math.round(studentTotalPerStudent),
    pricePerTeacher: Math.round(teacherTotalPerTeacher),
  };
}

export function formatCurrency(amount: number): string {
  return `€${Math.round(amount).toLocaleString()}`;
}