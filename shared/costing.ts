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

// Erasmus+ funding rates per day
export const ERASMUS_FUNDING = {
  students: {
    "Group 1": { days1to14: 66, day15plus: 46 }, // Norway, Denmark, Luxembourg, Iceland, Sweden, Ireland, Finland, Liechtenstein
    "Group 2": { days1to14: 57, day15plus: 40 }, // Netherlands, Austria, Belgium, France, Germany, Italy, Spain, Cyprus, Greece, Malta, Portugal
    "Group 3": { days1to14: 48, day15plus: 34 }, // Slovenia, Estonia, Latvia, Croatia, Slovakia, Czech Republic, Lithuania, Turkey, Hungary, Poland, Romania, Bulgaria, North Macedonia, Serbia
  },
  teachers: {
    "Group 1": { days1to14: 117, day15plus: 82 }, // Norway, Denmark, Luxembourg, Iceland, Sweden, Ireland, Finland, Liechtenstein
    "Group 2": { days1to14: 104, day15plus: 73 }, // Netherlands, Austria, Belgium, France, Germany, Italy, Spain, Cyprus, Greece, Malta, Portugal
    "Group 3": { days1to14: 91, day15plus: 64 }, // Slovenia, Estonia, Latvia, Croatia, Slovakia, Czech Republic, Lithuania, Turkey, Hungary, Poland, Romania, Bulgaria, North Macedonia, Serbia
  }
};

// Map destinations to Erasmus funding groups
export const ERASMUS_COUNTRY_GROUPS = {
  // Group 1 - High cost countries
  "Norway": "Group 1",
  "Denmark": "Group 1", 
  "Luxembourg": "Group 1",
  "Iceland": "Group 1",
  "Sweden": "Group 1",
  "Ireland": "Group 1",
  "Finland": "Group 1",
  "Liechtenstein": "Group 1",
  
  // Group 2 - Medium cost countries
  "Netherlands": "Group 2",
  "Austria": "Group 2",
  "Belgium": "Group 2", 
  "France": "Group 2",
  "Germany": "Group 2",
  "Italy": "Group 2",
  "Spain": "Group 2",
  "Cyprus": "Group 2",
  "Greece": "Group 2",
  "Malta": "Group 2",
  "Portugal": "Group 2",
  "United Kingdom": "Group 2", // Treating UK as Group 2 for calculation purposes
  
  // Group 3 - Lower cost countries
  "Slovenia": "Group 3",
  "Estonia": "Group 3",
  "Latvia": "Group 3",
  "Croatia": "Group 3",
  "Slovakia": "Group 3",
  "Czech Republic": "Group 3",
  "Lithuania": "Group 3",
  "Turkey": "Group 3",
  "Hungary": "Group 3",
  "Poland": "Group 3",
  "Romania": "Group 3",
  "Bulgaria": "Group 3",
  "North Macedonia": "Group 3",
  "Serbia": "Group 3",
};

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
    adhocServices: number;
    total: number;
  };
  groupDiscount: {
    percentage: number;
    amount: number;
    description: string;
  } | null;
  erasmusFunding: {
    group: string;
    students: {
      dailyRate1to14: number;
      dailyRate15plus: number;
      fundingPerStudent: number;
      totalStudentFunding: number;
    };
    teachers: {
      dailyRate1to14: number;
      dailyRate15plus: number;
      fundingPerTeacher: number;
      totalTeacherFunding: number;
    };
    totalFunding: number;
  } | null;
  internalCosts: {
    studentAccommodation: number;
    teacherAccommodation: number;
    meals: number;
    localTransportation: number;
    coordination: number;
    localCoordinator: number;
    totalCosts: number;
  };
  profitability: {
    revenue: number;
    costs: number;
    grossProfit: number;
    vat: number;
    netProfit: number;
    grossMarginPercentage: number;
    netMarginPercentage: number;
  };
  subtotal: number;
  total: number;
  netCostAfterErasmus: number;
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

export interface AdhocService {
  name: string;
  pricePerPerson: number;
}

export function calculateQuoteCost(
  destination: string,
  duration: string,
  numberOfStudents: number,
  numberOfTeachers: number,
  adhocServices: AdhocService[] = [],
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
  },
  internalCosts?: {
    costStudentAccommodationPerDay?: number;
    costTeacherAccommodationPerDay?: number;
    costBreakfastPerDay?: number;
    costLunchPerDay?: number;
    costDinnerPerDay?: number;
    costLocalTransportationCard?: number;
    costStudentCoordination?: number;
    costTeacherCoordination?: number;
    costLocalCoordinator?: number;
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
  const studentAirportTransfer = airportTransferRate * numberOfStudents;
  
  const studentTotalPerStudent = (studentAccommodationRate + breakfastRate + lunchRate + 
    dinnerRate) * days + transportCardTotal + studentCoordinationTotal + 
    airportTransferRate;
  const studentTotalForAll = studentAccommodation + studentMeals + studentTransportCard + 
    studentCoordinationFee + studentAirportTransfer;
  
  // Calculate teacher costs (use separate accommodation rate, discount on meals only)
  const teacherAccommodation = teacherAccommodationRate * days * numberOfTeachers;
  const teacherMeals = (breakfastRate + lunchRate + dinnerRate) * defaultPricing.teacherDiscount * days * numberOfTeachers;
  const teacherTransportCard = transportCardTotal * numberOfTeachers;
  const teacherCoordinationFee = teacherCoordinationTotal * numberOfTeachers;
  const teacherAirportTransfer = airportTransferRate * numberOfTeachers;
  
  const teacherTotalPerTeacher = (teacherAccommodationRate + (breakfastRate + lunchRate + 
    dinnerRate) * defaultPricing.teacherDiscount) * days + transportCardTotal + teacherCoordinationTotal + 
    airportTransferRate;
  const teacherTotalForAll = teacherAccommodation + teacherMeals + teacherTransportCard + 
    teacherCoordinationFee + teacherAirportTransfer;
  
  // Calculate adhoc services
  const additionalServices = {
    adhocServices: adhocServices.reduce((total, service) => 
      total + (service.pricePerPerson * (numberOfStudents + numberOfTeachers)), 0),
    total: 0,
  };
  
  additionalServices.total = additionalServices.adhocServices;
  
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
  
  // Calculate Erasmus+ funding for students and teachers
  const erasmusGroup = ERASMUS_COUNTRY_GROUPS[country];
  let erasmusFunding = null;
  
  if (erasmusGroup && ERASMUS_FUNDING.students[erasmusGroup] && ERASMUS_FUNDING.teachers[erasmusGroup]) {
    const studentRates = ERASMUS_FUNDING.students[erasmusGroup];
    const teacherRates = ERASMUS_FUNDING.teachers[erasmusGroup];
    
    // Calculate student funding based on trip duration
    let fundingPerStudent = 0;
    if (days <= 14) {
      fundingPerStudent = studentRates.days1to14 * days;
    } else {
      // First 14 days at higher rate, remaining days at lower rate
      fundingPerStudent = (studentRates.days1to14 * 14) + (studentRates.day15plus * (days - 14));
    }
    
    // Calculate teacher funding based on trip duration
    let fundingPerTeacher = 0;
    if (days <= 14) {
      fundingPerTeacher = teacherRates.days1to14 * days;
    } else {
      // First 14 days at higher rate, remaining days at lower rate
      fundingPerTeacher = (teacherRates.days1to14 * 14) + (teacherRates.day15plus * (days - 14));
    }
    
    const totalStudentFunding = fundingPerStudent * numberOfStudents;
    const totalTeacherFunding = fundingPerTeacher * numberOfTeachers;
    const totalFunding = totalStudentFunding + totalTeacherFunding;
    
    erasmusFunding = {
      group: `Erasmus+ ${erasmusGroup}`,
      students: {
        dailyRate1to14: studentRates.days1to14,
        dailyRate15plus: studentRates.day15plus,
        fundingPerStudent: fundingPerStudent,
        totalStudentFunding: totalStudentFunding,
      },
      teachers: {
        dailyRate1to14: teacherRates.days1to14,
        dailyRate15plus: teacherRates.day15plus,
        fundingPerTeacher: fundingPerTeacher,
        totalTeacherFunding: totalTeacherFunding,
      },
      totalFunding: totalFunding,
    };
  }

  // Calculate internal costs for profitability analysis
  const costStudentAccom = (internalCosts?.costStudentAccommodationPerDay || 0) * days * numberOfStudents;
  const costTeacherAccom = (internalCosts?.costTeacherAccommodationPerDay || 0) * days * numberOfTeachers;
  const costBreakfast = (internalCosts?.costBreakfastPerDay || 0) * days * (numberOfStudents + numberOfTeachers);
  const costLunch = (internalCosts?.costLunchPerDay || 0) * days * (numberOfStudents + numberOfTeachers);
  const costDinner = (internalCosts?.costDinnerPerDay || 0) * days * (numberOfStudents + numberOfTeachers);
  const costLocalTransport = (internalCosts?.costLocalTransportationCard || 0) * (numberOfStudents + numberOfTeachers);
  const costStudentCoord = (internalCosts?.costStudentCoordination || 60) * numberOfStudents;
  const costTeacherCoord = (internalCosts?.costTeacherCoordination || 0) * numberOfTeachers;
  const costLocalCoord = internalCosts?.costLocalCoordinator || 150;

  const totalInternalCosts = costStudentAccom + costTeacherAccom + costBreakfast + costLunch + costDinner + 
                           costLocalTransport + costStudentCoord + costTeacherCoord + costLocalCoord;

  const internalCostsBreakdown = {
    studentAccommodation: costStudentAccom,
    teacherAccommodation: costTeacherAccom,
    meals: costBreakfast + costLunch + costDinner,
    localTransportation: costLocalTransport,
    coordination: costStudentCoord + costTeacherCoord,
    localCoordinator: costLocalCoord,
    totalCosts: totalInternalCosts,
  };

  const total = subtotal - (groupDiscount?.amount || 0);
  const netCostAfterErasmus = total - (erasmusFunding?.totalFunding || 0);
  
  // Calculate profitability with VAT
  const revenue = total;
  const costs = totalInternalCosts;
  const grossProfit = revenue - costs;
  
  // Calculate VAT using formula: Net Profit = Gross Profit / 1.21
  const netProfit = grossProfit / 1.21;
  const vat = grossProfit - netProfit;
  
  const grossMarginPercentage = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const netMarginPercentage = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const profitability = {
    revenue,
    costs,
    grossProfit,
    vat,
    netProfit,
    grossMarginPercentage,
    netMarginPercentage,
  };
  
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
    erasmusFunding,
    internalCosts: internalCostsBreakdown,
    profitability,
    subtotal,
    total,
    netCostAfterErasmus: Math.round(netCostAfterErasmus),
    pricePerStudent: Math.round(studentTotalPerStudent),
    pricePerTeacher: Math.round(teacherTotalPerTeacher),
  };
}

export function formatCurrency(amount: number): string {
  return `€${Math.round(amount).toLocaleString()}`;
}