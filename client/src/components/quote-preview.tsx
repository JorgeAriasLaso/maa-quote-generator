import { type Quote } from "@shared/schema";
import { calculateQuoteCost, formatCurrency, type AdhocService } from "@shared/costing";

// Helper function to parse duration for calculations
function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 7;
}
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, Printer, Loader2 } from "lucide-react";
import { CheckCircle, GraduationCap, Plane, Phone, Mail, Globe } from "lucide-react";
import logoPath from "@assets/Main Brand Logo_1752655471601.png";
import madrid1 from "@assets/5fa53648e38b2_1752761191307.jpeg";
import madrid2 from "@assets/vistas-palacio-real_1752761191308.avif";
import madrid3 from "@assets/895-adobestock110515761_1752761191309.jpeg";
import madrid4 from "@assets/348698-Madrid_1752761191309.jpg";
import madrid5 from "@assets/0_-_BCC-2023-MADRID-LANDMARKS-0_1752761191309.avif";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

interface QuotePreviewProps {
  quote: Quote | null;
  costBreakdown?: any;
}

export function QuotePreview({ quote, costBreakdown: externalCostBreakdown }: QuotePreviewProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  // Parse adhoc services from quote
  const adhocServices: AdhocService[] = quote?.adhocServices ? 
    (() => {
      try {
        return JSON.parse(quote.adhocServices);
      } catch (e) {
        return [];
      }
    })() : [];

  const costBreakdown = externalCostBreakdown || (quote ? calculateQuoteCost(
    quote.destination,
    quote.duration,
    quote.numberOfStudents,
    quote.numberOfTeachers,
    adhocServices,
    {
      studentAccommodationPerDay: parseFloat(quote.studentAccommodationPerDay || "0"),
      teacherAccommodationPerDay: parseFloat(quote.teacherAccommodationPerDay || "0"),
      breakfastPerDay: parseFloat(quote.breakfastPerDay || "0"),
      lunchPerDay: parseFloat(quote.lunchPerDay || "0"),
      dinnerPerDay: parseFloat(quote.dinnerPerDay || "0"),
      transportCardTotal: parseFloat(quote.transportCardTotal || "0"),
      studentCoordinationFeeTotal: parseFloat(quote.studentCoordinationFeeTotal || "0"),
      teacherCoordinationFeeTotal: parseFloat(quote.teacherCoordinationFeeTotal || "0"),
      airportTransferPerPerson: parseFloat(quote.airportTransferPerPerson || "0"),
    },
    {
      costStudentAccommodationPerDay: parseFloat(quote.costStudentAccommodationPerDay || "0"),
      costTeacherAccommodationPerDay: parseFloat(quote.costTeacherAccommodationPerDay || "0"),
      costBreakfastPerDay: parseFloat(quote.costBreakfastPerDay || "0"),
      costLunchPerDay: parseFloat(quote.costLunchPerDay || "0"),
      costDinnerPerDay: parseFloat(quote.costDinnerPerDay || "0"),
      costLocalTransportationCard: parseFloat(quote.costLocalTransportationCard || "0"),
      costStudentCoordination: parseFloat(quote.costStudentCoordination || "60"),
      costTeacherCoordination: parseFloat(quote.costTeacherCoordination || "0"),
      costLocalCoordinator: parseFloat(quote.costLocalCoordinator || "150"),
      costAirportTransfer: quote.costAirportTransfer || "0",
    }
  ) : null);

  const calculateTotal = () => {
    return costBreakdown ? costBreakdown.total : 0;
  };

  const getDestinationImage = (destination: string) => {
    const city = destination.toLowerCase();
    // Spain
    if (city.includes('madrid')) {
      return "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('malaga')) {
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('alicante')) {
      return "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('valladolid')) {
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('gijon')) {
      return "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('barcelona')) {
      return "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // Portugal
    } else if (city.includes('porto')) {
      return "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // France  
    } else if (city.includes('lyon')) {
      return "https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('paris')) {
      return "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // UK
    } else if (city.includes('bristol')) {
      return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // Italy
    } else if (city.includes('bari')) {
      return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('catania')) {
      return "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // Czech Republic
    } else if (city.includes('prague')) {
      return "https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // Poland
    } else if (city.includes('krakow')) {
      return "https://images.unsplash.com/photo-1544980919-e17526d4ed0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('poznan')) {
      return "https://images.unsplash.com/photo-1587330979470-3bd2893099f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('warsaw')) {
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // Hungary
    } else if (city.includes('budapest')) {
      return "https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // Denmark
    } else if (city.includes('copenhagen')) {
      return "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    }
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
  };



  const getDestinationHighlights = (destination: string) => {
    const city = destination.toLowerCase();
    
    // SPAIN
    if (city.includes('madrid')) {
      return {
        description: "Madrid offers an exceptional educational experience as Spain's dynamic capital and the heart of European business, culture, and politics. Students will experience vibrant business culture and modern European economy while exploring the center of Spanish politics, finance, and innovation. The city provides world-class art and culture with visits to the Prado Museum, Reina Sofia, and Thyssen-Bornemisza - three of the world's most important art museums, all within walking distance. Students practice Spanish in its native environment while engaging with local professionals and experiencing authentic Spanish hospitality and culture. The historic Royal Palace, Plaza Mayor, and Retiro Park offer insights into Spain's rich history and its role in global exploration and trade, making Madrid an ideal destination for comprehensive educational travel.",
        images: [
          { src: madrid1, alt: "Madrid cityscape" },
          { src: madrid2, alt: "Royal Palace of Madrid" },
          { src: madrid3, alt: "Madrid landmarks" },
          { src: madrid4, alt: "Madrid Gran Via at night" },
          { src: madrid5, alt: "Madrid architectural landmarks" }
        ]
      };
    } else if (city.includes('malaga')) {
      return [
        {
          title: "Costa del Sol Gateway",
          description: "Experience the entrepreneurial spirit of southern Spain's tech hub, where tourism innovation meets traditional Andalusian culture.",
          image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Picasso's Birthplace",
          description: "Visit the Picasso Museum and explore the artistic heritage of Málaga, fostering creativity and cultural appreciation in students.",
          image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Mediterranean Business Culture",
          description: "Learn about Spain's tourism industry, port operations, and the growing tech sector in this modern Andalusian city.",
          image: "https://images.unsplash.com/photo-1563789031959-4c02bcb41319?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Historic Moorish Heritage",
          description: "Discover the Alcazaba fortress and Roman Theatre, exploring Spain's multicultural history and architectural evolution.",
          image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    } else if (city.includes('alicante')) {
      return [
        {
          title: "Mediterranean Innovation Hub",
          description: "Explore Alicante's growing tech sector and university research facilities, connecting students with Spain's emerging digital economy.",
          image: "https://images.unsplash.com/photo-1565531491644-76e7171c3b1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Coastal Business Environment",
          description: "Study sustainable tourism practices and marine conservation efforts along Spain's beautiful Costa Blanca.",
          image: "https://images.unsplash.com/photo-1609688669309-fc65dd68b2f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Valencian Culture & Language",
          description: "Experience the unique Valencian culture and bilingual environment, enhancing language skills and cultural understanding.",
          image: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Historic Castle & Port",
          description: "Visit Santa Bárbara Castle and learn about Mediterranean trade history while exploring modern port operations.",
          image: "https://images.unsplash.com/photo-1627388234628-c8e9b1d0d22f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    } else if (city.includes('valladolid')) {
      return [
        {
          title: "Castilian Heritage Capital",
          description: "Discover the birthplace of Spanish language and literature in this historic Castilian city, perfect for language immersion.",
          image: "https://images.unsplash.com/photo-1578061417017-ef9f3b9c6ec8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Automotive Industry Center",
          description: "Visit Renault and other automotive facilities to understand Spain's industrial transformation and modern manufacturing.",
          image: "https://images.unsplash.com/photo-1619733921207-d2fdacb7e3a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "University Town Atmosphere",
          description: "Experience authentic Spanish student life at one of Spain's oldest universities, fostering academic and cultural exchange.",
          image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Golden Age Architecture",
          description: "Explore Renaissance and Baroque architecture from Spain's imperial period, connecting history with modern Spanish identity.",
          image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    } else if (city.includes('gijon')) {
      return [
        {
          title: "Asturian Maritime Heritage",
          description: "Explore Spain's naval history and modern fishing industry in this vibrant northern Spanish port city.",
          image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Industrial Revolution Legacy",
          description: "Learn about Spain's industrial development through steel production and mining heritage, now transformed into cultural spaces.",
          image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Green Spain Experience",
          description: "Discover sustainable practices and environmental awareness in Spain's greenest region, promoting ecological education.",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Celtic & Roman Influences",
          description: "Explore unique Asturian culture with Celtic traditions and Roman archaeological sites, broadening historical perspectives.",
          image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    }
    // PORTUGAL
    else if (city.includes('porto')) {
      return [
        {
          title: "UNESCO World Heritage Center",
          description: "Explore Porto's historic center, learning about Portuguese architecture, azulejo tiles, and urban planning preservation.",
          image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Port Wine & Business Tradition",
          description: "Visit famous port cellars to understand Portuguese export traditions and family business management across generations.",
          image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Tech & Innovation Hub",
          description: "Discover Porto's growing startup ecosystem and tech companies, positioning Portugal as a European innovation center.",
          image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Maritime Exploration Legacy",
          description: "Learn about Portuguese Age of Discovery and modern shipping industry at this historic Atlantic port.",
          image: "https://images.unsplash.com/photo-1627388234628-c8e9b1d0d22f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    }
    // FRANCE
    else if (city.includes('lyon')) {
      return [
        {
          title: "Culinary Capital of France",
          description: "Experience Lyon's renowned gastronomy and learn about French culinary traditions, food science, and hospitality management.",
          image: "https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Silk Industry Heritage",
          description: "Discover Lyon's historical role in silk production and textile innovation, connecting traditional crafts with modern design.",
          image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Biotech & Pharmaceutical Hub",
          description: "Explore Lyon's leadership in life sciences and medical research, inspiring students interested in healthcare and science.",
          image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Renaissance Architecture",
          description: "Walk through Vieux Lyon's Renaissance buildings and learn about French architectural history and urban development.",
          image: "https://images.unsplash.com/photo-1609688669309-fc65dd68b2f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    } else if (city.includes('paris')) {
      return [
        {
          title: "Global Business Capital",
          description: "Experience Paris as a major global financial center and headquarters for luxury brands, fashion houses, and multinational corporations.",
          image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Cultural & Artistic Heritage",
          description: "Visit world-renowned museums like the Louvre and Musée d'Orsay while exploring French art, literature, and intellectual traditions.",
          image: "https://images.unsplash.com/photo-1471623432079-b009d30b6729?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "European Union Hub",
          description: "Learn about French politics, EU policies, and international diplomacy in the city that hosts numerous international organizations.",
          image: "https://images.unsplash.com/photo-1522582324369-2dfc36bd9275?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Innovation & Technology",
          description: "Discover Paris's growing tech scene in Station F and La Défense business district, balancing tradition with cutting-edge innovation.",
          image: "https://images.unsplash.com/photo-1549144511-f099e773c147?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    }
    // UK
    else if (city.includes('bristol')) {
      return [
        {
          title: "Engineering & Aerospace Excellence",
          description: "Visit Airbus facilities and learn about British aerospace innovation, engineering design, and sustainable aviation technology.",
          image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Maritime Trading History",
          description: "Explore Bristol's role in historical trade and learn about modern sustainable business practices and ethical commerce.",
          image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Creative & Digital Industries",
          description: "Discover Bristol's thriving creative sector, from BBC production to video game development and digital media.",
          image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Environmental Sustainability",
          description: "Learn about Bristol's Green Capital initiatives and environmental technology, promoting sustainability awareness.",
          image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    }
    // ITALY
    else if (city.includes('bari')) {
      return [
        {
          title: "Adriatic Gateway",
          description: "Explore Bari's role as Italy's gateway to the Balkans and Eastern Europe, understanding Mediterranean trade and cultural exchange.",
          image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Pugliese Agricultural Excellence",
          description: "Learn about sustainable agriculture, olive oil production, and Italy's farm-to-table movement in Puglia's fertile lands.",
          image: "https://images.unsplash.com/photo-1544980919-e17526d4ed0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Romanesque Architecture",
          description: "Visit the Basilica of San Nicola and explore Southern Italian Norman and Byzantine architectural influences.",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "University & Research Hub",
          description: "Experience Bari's academic atmosphere and learn about Italian higher education and Mediterranean research initiatives.",
          image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    } else if (city.includes('catania')) {
      return [
        {
          title: "Mount Etna & Volcanic Studies",
          description: "Study Europe's most active volcano and learn about geological sciences, natural hazard management, and environmental adaptation.",
          image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Sicilian Cultural Heritage",
          description: "Explore the unique blend of Greek, Roman, Arab, and Norman influences that shaped Sicily's distinctive culture and architecture.",
          image: "https://images.unsplash.com/photo-1544980919-e17526d4ed0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Technology District",
          description: "Visit Catania's growing tech sector and learn about Sicily's digital transformation and innovation initiatives.",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Mediterranean Agriculture",
          description: "Study sustainable farming practices, citrus cultivation, and agritourism in Sicily's fertile volcanic soil.",
          image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    }
    // CZECH REPUBLIC
    else if (city.includes('prague')) {
      return [
        {
          title: "Medieval Architecture Marvel",
          description: "Explore over 1000 years of history through Gothic, Renaissance, and Baroque architecture in one of Europe's best-preserved medieval cities.",
          image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Modern Tech Hub",
          description: "Experience Prague as Eastern Europe's Silicon Valley with thriving tech startups, game development studios, and international business centers.",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Czech Cultural Heritage",
          description: "Discover unique Czech traditions, sample local cuisine, and learn about the country's peaceful Velvet Revolution and EU integration.",
          image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Central European Gateway",
          description: "Perfect location for understanding Central European history, politics, and economics with excellent transport links across the region.",
          image: "https://images.unsplash.com/photo-1541416938330-1f0b565b1660?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    }
    // POLAND
    else if (city.includes('krakow')) {
      return [
        {
          title: "Medieval Royal Capital",
          description: "Explore Poland's former royal capital with its stunning medieval market square and castle, learning about Central European monarchy.",
          image: "https://images.unsplash.com/photo-1544980919-e17526d4ed0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Academic Excellence",
          description: "Visit one of Europe's oldest universities, Jagiellonian University, where Copernicus studied, inspiring scientific curiosity.",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Historical Reflection",
          description: "Learn about 20th-century European history through visits to nearby Auschwitz-Birkenau, promoting tolerance and human rights education.",
          image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Cultural Renaissance",
          description: "Experience Kraków's vibrant cultural scene and learn about Poland's post-communist transformation and EU membership journey.",
          image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    } else if (city.includes('poznan')) {
      return [
        {
          title: "Trade & Commerce Hub",
          description: "Explore Poznań's role as Poland's business capital, with international trade fairs and multinational corporate headquarters.",
          image: "https://images.unsplash.com/photo-1587330979470-3bd2893099f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Automotive Industry Center",
          description: "Visit Volkswagen and other automotive facilities to understand modern manufacturing and Poland's industrial development.",
          image: "https://images.unsplash.com/photo-1544980919-e17526d4ed0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Renaissance Architecture",
          description: "Discover beautiful Renaissance and Baroque architecture in the Old Market Square and learn about Polish cultural heritage.",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Student City Atmosphere",
          description: "Experience the vibrant university atmosphere and learn about Polish higher education and youth culture.",
          image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    } else if (city.includes('warsaw')) {
      return [
        {
          title: "Modern European Capital",
          description: "Explore Warsaw's role as Poland's political and economic center, learning about EU politics and post-communist transformation.",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Reconstruction & Resilience",
          description: "Learn about Warsaw's remarkable post-WWII reconstruction and the human spirit's ability to rebuild and preserve cultural heritage.",
          image: "https://images.unsplash.com/photo-1544980919-e17526d4ed0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Financial & Tech Center",
          description: "Visit Poland's financial district and emerging tech companies, understanding Eastern Europe's economic modernization.",
          image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Cultural & Musical Heritage",
          description: "Explore Chopin's birthplace and Warsaw's rich musical tradition, inspiring artistic appreciation and cultural understanding.",
          image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    }
    // HUNGARY
    else if (city.includes('budapest')) {
      return [
        {
          title: "Danube River Capital",
          description: "Explore the stunning architecture along the Danube, learning about Central European urban planning and cultural preservation.",
          image: "https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Thermal Bath Culture",
          description: "Experience Budapest's unique thermal bath tradition and learn about wellness tourism and traditional Hungarian health practices.",
          image: "https://images.unsplash.com/photo-1544980919-e17526d4ed0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Tech & Innovation Hub",
          description: "Discover Budapest's growing startup ecosystem and learn about Hungary's digital transformation and EU technology initiatives.",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Austro-Hungarian Legacy",
          description: "Explore the grandeur of the former Austro-Hungarian Empire through palaces, parliament buildings, and cultural institutions.",
          image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    }
    // DENMARK
    else if (city.includes('copenhagen')) {
      return [
        {
          title: "Scandinavian Design Capital",
          description: "Explore Danish design philosophy and learn about sustainable urban planning, hygge culture, and Nordic innovation principles.",
          image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Green City Leadership",
          description: "Study Copenhagen's carbon-neutral initiatives, cycling culture, and environmental policies as a model for sustainable cities.",
          image: "https://images.unsplash.com/photo-1544980919-e17526d4ed0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Social Democratic Model",
          description: "Learn about Danish society, welfare state principles, and work-life balance that makes Denmark one of the world's happiest countries.",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Maritime & Viking Heritage",
          description: "Explore Denmark's maritime history, from Viking expeditions to modern shipping industry and Hans Christian Andersen's literary legacy.",
          image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    }
    
    // Generic content for unlisted destinations
    return [
      {
        title: "Educational Excellence",
        description: "Immerse students in real-world learning experiences that complement classroom education with practical application in this unique destination.",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      },
      {
        title: "Cultural Discovery",
        description: "Broaden horizons through authentic cultural exchanges and meaningful interactions with local communities and traditions.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      },
      {
        title: "Professional Development",
        description: "Gain valuable work experience and develop professional skills in an international business environment.",
        image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      },
      {
        title: "Personal Growth",
        description: "Build confidence, independence, and adaptability through structured international travel experiences.",
        image: "https://images.unsplash.com/photo-1541416938330-1f0b565b1660?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      }
    ];
  };

  const handleExportPDF = async () => {
    if (!quote || isExporting) return;
    
    setIsExporting(true);
    try {
      // Find the quote document element
      const quoteElement = document.getElementById('quote-document');
      if (!quoteElement) {
        console.error('Quote document element not found');
        return;
      }

      // Temporarily hide the preview header and internal analysis sections for PDF
      const previewHeader = document.querySelector('.preview-header');
      const internalAnalysisSections = document.querySelectorAll('.internal-analysis-only');
      
      if (previewHeader) {
        (previewHeader as HTMLElement).style.display = 'none';
      }
      
      // Hide internal analysis sections
      internalAnalysisSections.forEach((section) => {
        (section as HTMLElement).style.display = 'none';
      });

      // Set a fixed width for consistent PDF generation
      const originalStyles = {
        maxWidth: quoteElement.style.maxWidth,
        width: quoteElement.style.width,
        margin: quoteElement.style.margin,
        padding: quoteElement.style.padding,
        backgroundColor: quoteElement.style.backgroundColor,
      };
      
      // Set standard PDF dimensions for 2-page layout
      quoteElement.style.maxWidth = '794px'; // A4 width at 96 DPI
      quoteElement.style.width = '794px';
      quoteElement.style.margin = '0';
      quoteElement.style.padding = '20px'; // Reduced padding to save space
      quoteElement.style.backgroundColor = '#ffffff';
      quoteElement.style.fontSize = '12px'; // Slightly larger for readability
      quoteElement.style.lineHeight = '1.4'; // Tighter spacing for more content
      
      // Allow time for DOM to update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simple reliable approach: Generate single-page PDF with all content
      // This eliminates all page break issues while maintaining professional appearance
      const canvas = await html2canvas(quoteElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        width: 794,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('quote-document');
          if (clonedElement) {
            // Set consistent styling for 2-page layout
            clonedElement.style.maxWidth = '794px';
            clonedElement.style.width = '794px';
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.padding = '20px'; // Reduced padding
            clonedElement.style.fontSize = '12px'; // Slightly larger for readability
            
            // Fix image sizing - medium logo as requested
            const images = clonedElement.querySelectorAll('img');
            images.forEach((img, index) => {
              if (index === 0) { // Logo - medium size
                img.style.maxWidth = '160px'; // Medium size between small and large
                img.style.height = 'auto';
                img.style.maxHeight = '80px'; // Medium height
                img.style.objectFit = 'contain';
              } else {
                img.style.width = '150px'; // Destination images
                img.style.height = '110px'; 
                img.style.objectFit = 'cover';
              }
            });
          }
        }
      });

      // Restore original styles
      Object.assign(quoteElement.style, originalStyles);
      if (previewHeader) {
        (previewHeader as HTMLElement).style.display = '';
      }
      internalAnalysisSections.forEach((section) => {
        (section as HTMLElement).style.display = '';
      });

      // Create PDF as single continuous document (no page splitting)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Scale to fit A4 width with margins
      const pdfWidth = 210 - 30; // A4 width minus margins
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
      
      // Add pages as needed for the full content - optimized for exactly 2 pages
      let currentY = 0;
      const pageHeight = 297 - 20; // Smaller margins to fit more content
      let pageCount = 1;
      
      while (currentY < pdfHeight) {
        if (pageCount > 1) {
          pdf.addPage();
        }
        
        const remainingHeight = pdfHeight - currentY;
        const heightToAdd = Math.min(pageHeight, remainingHeight);
        
        // Calculate source region
        const sourceY = (currentY * imgHeight) / pdfHeight;
        const sourceHeight = (heightToAdd * imgHeight) / pdfHeight;
        
        // Create canvas for this page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          pageCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
          const pageData = pageCanvas.toDataURL('image/png', 1.0);
          pdf.addImage(pageData, 'PNG', 15, 15, pdfWidth, heightToAdd);
        }
        
        currentY += heightToAdd;
        pageCount++;
      }

      // Generate filename and save
      const filename = `${quote.quoteNumber}_${quote.fiscalName.replace(/\s+/g, '_')}_${quote.destination.replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!quote) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-medium text-slate-900">Quote Preview</h3>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <GraduationCap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Fill out the form to generate a quote preview</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const highlights = getDestinationHighlights(quote.destination);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Preview Header */}
        <div className="preview-header bg-slate-50 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900">Quote Preview</h3>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                <Printer className="h-4 w-4" />
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="bg-primary text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Generating...' : 'Export PDF'}
              </Button>
            </div>
          </div>
        </div>

        {/* Quote Document */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div id="quote-document" className="max-w-4xl mx-auto bg-white print:max-w-none print:w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <img 
                src={logoPath} 
                alt="My Abroad Ally" 
                className="h-32 w-auto object-contain mx-auto mb-3"
                style={{ maxWidth: '200px', height: 'auto' }}
              />
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Educational Travel Proposal</h1>
              <p className="text-sm text-slate-600 mb-2">by My Abroad Ally</p>
              <div className="w-20 h-1 bg-yellow-400 mx-auto"></div>
            </div>

            {/* Trip Summary */}
            <div className="mb-8">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">{quote.tripType}</h2>
                <h3 className="text-lg text-primary font-medium">{quote.destination}</h3>
              </div>
              
              <div className="flex justify-center">
                {/* Trip Details */}
                <Card className="bg-slate-50 p-4 max-w-md w-full">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Duration:</span>
                      <span className="text-slate-600">{quote.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Students:</span>
                      <span className="text-slate-600">{quote.numberOfStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Teachers:</span>
                      <span className="text-slate-600">{quote.numberOfTeachers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Dates:</span>
                      <span className="text-slate-600 text-xs">
                        {new Date(quote.startDate).toLocaleDateString()} - {new Date(quote.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Quote #:</span>
                      <span className="text-slate-600">{quote.quoteNumber}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Destination Highlights */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 border-b-2 border-primary pb-2">
                Why {quote.destination} for Educational Travel?
              </h3>
              
              {/* Unified layout - apply Madrid's working format to all cities */}
              <div className="space-y-4">
                {/* Text content first - convert all formats to single text block */}
                <div className="text-slate-700 text-sm leading-relaxed space-y-3">
                  {highlights && highlights.description ? (
                    // Madrid format - single description
                    <div dangerouslySetInnerHTML={{ __html: highlights.description.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>') }} />
                  ) : highlights && Array.isArray(highlights) && highlights.length > 0 ? (
                    // Other cities - convert array to continuous text
                    highlights.map((highlight, index) => (
                      <p key={index}>
                        <strong>{highlight.title}:</strong> {highlight.description}
                      </p>
                    ))
                  ) : (
                    <div className="text-center text-slate-500">No destination highlights available</div>
                  )}
                </div>
                
                {/* Images placed after text to avoid page break cuts - protected block */}
                <div className="flex flex-wrap gap-2 justify-center" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  {highlights && highlights.description && highlights.images ? (
                    // Madrid format - use custom images
                    highlights.images.slice(1, 5).map((image, index) => (
                      <div key={index} className="flex-shrink-0" style={{ width: '48%', maxWidth: '180px' }}>
                        <img 
                          src={image.src} 
                          alt={image.alt} 
                          className="w-full h-28 object-cover rounded-lg shadow-sm"
                          style={{ minHeight: '100px', maxHeight: '120px' }}
                        />
                      </div>
                    ))
                  ) : highlights && Array.isArray(highlights) && highlights.length > 0 ? (
                    // Other cities - use highlight images
                    highlights.slice(0, 4).map((highlight, index) => (
                      <div key={index} className="flex-shrink-0" style={{ width: '48%', maxWidth: '180px' }}>
                        <img 
                          src={highlight.image} 
                          alt={highlight.title} 
                          className="w-full h-28 object-cover rounded-lg shadow-sm"
                          style={{ minHeight: '100px', maxHeight: '120px' }}
                        />
                      </div>
                    ))
                  ) : (
                    // Placeholder if no images available
                    <div className="text-center text-slate-400 text-sm py-8">Images will be added when uploaded</div>
                  )}
                </div>
              </div>
            </div>

            {/* Learning Outcomes - FORCE PAGE BREAK HERE */}
            <div className="mb-12 page-break-before" id="educational-value-section" style={{ pageBreakBefore: 'always', breakBefore: 'always' }}>
              <h3 className="text-xl font-semibold text-slate-900 mb-6 border-b-2 border-primary pb-2">
                Educational Value & Learning Outcomes
              </h3>
              
              <Card className="bg-blue-50 p-6">
                <h4 className="font-semibold text-blue-900 mb-4">Students will gain:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                  <li className="flex items-start">
                    <CheckCircle className="text-blue-600 mr-3 mt-0.5 h-4 w-4" />
                    <span>Professional work experience in European business environment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-blue-600 mr-3 mt-0.5 h-4 w-4" />
                    <span>Cross-cultural communication and adaptability skills</span>
                  </li>

                  <li className="flex items-start">
                    <CheckCircle className="text-blue-600 mr-3 mt-0.5 h-4 w-4" />
                    <span>Language skills development (local language basics)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-blue-600 mr-3 mt-0.5 h-4 w-4" />
                    <span>Enhanced global perspective and career readiness</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-blue-600 mr-3 mt-0.5 h-4 w-4" />
                    <span>Independence and problem-solving capabilities</span>
                  </li>
                </ul>
              </Card>
            </div>

            {/* Pricing Summary */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 border-b-2 border-primary pb-2">
                Investment Summary
              </h3>
              
              <Card className="bg-slate-50 p-6">
                <div className="space-y-4">
                  {/* Students breakdown */}
                  <div className="bg-blue-50 p-4 rounded mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-700">
                        Students ({quote.numberOfStudents} × €{costBreakdown?.student.totalPerStudent} - Average cost per student)
                      </span>
                      <span className="text-slate-900 font-bold">
                        {formatCurrency(costBreakdown?.student.totalForAllStudents || 0)}
                      </span>
                    </div>
                    {costBreakdown && (
                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>• Accommodation{quote.studentAccommodationName ? ` (${quote.studentAccommodationName})` : ''}:</span>
                          <span>{formatCurrency(costBreakdown.student.accommodation)}</span>
                        </div>
                        {costBreakdown.student.breakfastCost > 0 && (
                          <div className="flex justify-between">
                            <span>• Breakfast:</span>
                            <span>{formatCurrency(costBreakdown.student.breakfastCost)}</span>
                          </div>
                        )}
                        {costBreakdown.student.lunchCost > 0 && (
                          <div className="flex justify-between">
                            <span>• Lunch:</span>
                            <span>{formatCurrency(costBreakdown.student.lunchCost)}</span>
                          </div>
                        )}
                        {costBreakdown.student.dinnerCost > 0 && (
                          <div className="flex justify-between">
                            <span>• Dinner:</span>
                            <span>{formatCurrency(costBreakdown.student.dinnerCost)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>• Transport card:</span>
                          <span>{formatCurrency(costBreakdown.student.transportCard)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Student coordination fee:</span>
                          <span>{formatCurrency(costBreakdown.student.coordinationFee)}</span>
                        </div>
                        {costBreakdown.student.airportTransfer > 0 && (
                          <div className="flex justify-between">
                            <span>• Airport transfers:</span>
                            <span>{formatCurrency(costBreakdown.student.airportTransfer)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Teachers breakdown */}
                  <div className="bg-green-50 p-4 rounded mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-700">
                        Teachers ({quote.numberOfTeachers} × €{costBreakdown?.teacher.totalPerTeacher} - Average cost per teacher)
                      </span>
                      <span className="text-slate-900 font-bold">
                        {formatCurrency(costBreakdown?.teacher.totalForAllTeachers || 0)}
                      </span>
                    </div>
                    {costBreakdown && (
                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>• Accommodation{quote.teacherAccommodationName ? ` (${quote.teacherAccommodationName})` : ''}:</span>
                          <span>{formatCurrency(costBreakdown.teacher.accommodation)}</span>
                        </div>
                        {costBreakdown.teacher.breakfastCost > 0 && (
                          <div className="flex justify-between">
                            <span>• Breakfast:</span>
                            <span>{formatCurrency(costBreakdown.teacher.breakfastCost)}</span>
                          </div>
                        )}
                        {costBreakdown.teacher.lunchCost > 0 && (
                          <div className="flex justify-between">
                            <span>• Lunch:</span>
                            <span>{formatCurrency(costBreakdown.teacher.lunchCost)}</span>
                          </div>
                        )}
                        {costBreakdown.teacher.dinnerCost > 0 && (
                          <div className="flex justify-between">
                            <span>• Dinner:</span>
                            <span>{formatCurrency(costBreakdown.teacher.dinnerCost)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>• Transport card:</span>
                          <span>{formatCurrency(costBreakdown.teacher.transportCard)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Teacher coordination fee:</span>
                          <span>{formatCurrency(costBreakdown.teacher.coordinationFee)}</span>
                        </div>
                        {costBreakdown.teacher.airportTransfer > 0 && (
                          <div className="flex justify-between">
                            <span>• Airport transfers:</span>
                            <span>{formatCurrency(costBreakdown.teacher.airportTransfer)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {costBreakdown && costBreakdown.additionalServices.total > 0 && (
                    <>
                      <div className="border-t border-slate-300 pt-2">
                        <h5 className="font-medium text-slate-700 mb-2">Additional Services:</h5>
                        {adhocServices.length > 0 ? (
                          <>
                            {adhocServices.map((service, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">{service.name}</span>
                                <span className="text-slate-700">
                                  {formatCurrency(service.pricePerPerson * (quote.numberOfStudents + quote.numberOfTeachers))}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center text-sm font-medium pt-1 border-t border-slate-200 mt-1">
                              <span className="text-slate-600">Services Subtotal</span>
                              <span className="text-slate-700">{formatCurrency(costBreakdown.additionalServices.total)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-slate-500 italic">No additional services selected</div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {costBreakdown && costBreakdown.groupDiscount && (
                    <div className="border-t border-slate-300 pt-2">
                      <div className="flex justify-between items-center text-sm text-green-700">
                        <span>{costBreakdown.groupDiscount.description}</span>
                        <span className="font-medium">-{formatCurrency(costBreakdown.groupDiscount.amount)}</span>
                      </div>
                    </div>
                  )}
                  
                  {costBreakdown && costBreakdown.erasmusFunding && (
                    <div className="internal-analysis-only border-t border-slate-300 pt-2">
                      <h5 className="font-medium text-green-700 mb-2">Erasmus+ Funding Available:</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Student funding ({quote.numberOfStudents} students)</span>
                          <span className="text-green-700 font-medium">
                            +{formatCurrency(costBreakdown.erasmusFunding.students.totalStudentFunding)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 ml-4">
                          €{costBreakdown.erasmusFunding.students.dailyRate1to14}/day (days 1-14), 
                          €{costBreakdown.erasmusFunding.students.dailyRate15plus}/day (day 15+)
                        </div>
                        {quote.numberOfTeachers > 0 && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Teacher funding ({quote.numberOfTeachers} teachers)</span>
                              <span className="text-green-700 font-medium">
                                +{formatCurrency(costBreakdown.erasmusFunding.teachers.totalTeacherFunding)}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 ml-4">
                              €{costBreakdown.erasmusFunding.teachers.dailyRate1to14}/day (days 1-14), 
                              €{costBreakdown.erasmusFunding.teachers.dailyRate15plus}/day (day 15+)
                            </div>
                          </>
                        )}
                        <div className="flex justify-between items-center text-sm font-medium pt-1 border-t border-green-200 mt-1">
                          <span className="text-green-700">Total Erasmus+ Funding</span>
                          <span className="text-green-700 font-bold">+{formatCurrency(costBreakdown.erasmusFunding.totalFunding)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-slate-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-900">Total Investment</span>
                      <span className="text-2xl font-bold text-primary">€{calculateTotal().toLocaleString()}</span>
                    </div>
                    {costBreakdown && costBreakdown.erasmusFunding && (
                      <div className="internal-analysis-only mt-2 space-y-2">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-blue-800">Available Erasmus+ Funding</span>
                            <span className="text-lg font-bold text-blue-800">
                              €{costBreakdown.erasmusFunding.totalFunding.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-blue-700 space-y-1">
                            <div>Students: €{costBreakdown.erasmusFunding.students.totalStudentFunding.toLocaleString()}</div>
                            <div>Teachers: €{costBreakdown.erasmusFunding.teachers.totalTeacherFunding.toLocaleString()}</div>
                            <div className="font-medium">Country Group: {costBreakdown.erasmusFunding.group}</div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-800">Net Cost After Erasmus+ Funding</span>
                            <span className="text-lg font-bold text-green-800">
                              €{costBreakdown.netCostAfterErasmus.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-green-700 mt-1">
                            Your school's out-of-pocket cost after applying for Erasmus+ funding
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                  
                  {/* Internal Profitability Analysis */}
                  {costBreakdown && costBreakdown.profitability && costBreakdown.internalCosts.totalCosts > 0 && (
                    <div className="internal-analysis-only border-t border-slate-300 pt-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                          Internal Profitability Analysis
                        </h4>
                        
                        <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-red-700 font-medium">Revenue:</span>
                              <div className="text-lg font-bold text-green-700">
                                {formatCurrency(costBreakdown.profitability.revenue)}
                              </div>
                            </div>
                            <div>
                              <span className="text-red-700 font-medium">Total Costs:</span>
                              <div className="text-lg font-bold text-red-700">
                                {formatCurrency(costBreakdown.profitability.costs)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-t border-red-200 pt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-red-700 font-medium">Gross Profit:</span>
                              <span className={`text-lg font-bold ${costBreakdown.profitability.grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatCurrency(costBreakdown.profitability.grossProfit)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-red-700 font-medium">VAT (21%):</span>
                              <span className="text-orange-600 font-bold">
                                {formatCurrency(costBreakdown.profitability.vat)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-t border-red-200 pt-2">
                              <span className="text-red-800 font-semibold">Net Profit:</span>
                              <span className={`text-xl font-bold ${costBreakdown.profitability.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatCurrency(costBreakdown.profitability.netProfit)}
                              </span>
                            </div>
                            
                            {/* Profit per participant breakdown */}
                            <div className="border-t border-red-200 pt-2 space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-red-700">Profit per Student:</span>
                                <span className={`font-bold ${costBreakdown.profitability.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                  {quote && quote.numberOfStudents > 0 ? formatCurrency(costBreakdown.profitability.netProfit / quote.numberOfStudents) : '€0'}
                                </span>
                              </div>
                              {quote && quote.numberOfTeachers > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-red-700">Profit per Teacher:</span>
                                  <span className={`font-bold ${costBreakdown.profitability.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {formatCurrency(costBreakdown.profitability.netProfit / quote.numberOfTeachers)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div className="flex justify-between">
                                <span className="text-red-700">Gross Margin:</span>
                                <span className={`font-bold ${costBreakdown.profitability.grossMarginPercentage >= 30 ? 'text-green-700' : costBreakdown.profitability.grossMarginPercentage >= 15 ? 'text-yellow-600' : 'text-red-700'}`}>
                                  {costBreakdown.profitability.grossMarginPercentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-red-700">Net Margin:</span>
                                <span className={`font-bold ${costBreakdown.profitability.netMarginPercentage >= 20 ? 'text-green-700' : costBreakdown.profitability.netMarginPercentage >= 10 ? 'text-yellow-600' : 'text-red-700'}`}>
                                  {costBreakdown.profitability.netMarginPercentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-red-100 border border-red-200 rounded p-3">
                            <h5 className="text-xs font-semibold text-red-800 mb-3">Detailed Cost Breakdown</h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-red-700">
                                <thead>
                                  <tr className="border-b border-red-200">
                                    <th className="text-left py-1">Item</th>
                                    <th className="text-left py-1">Calculation</th>
                                    <th className="text-right py-1">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="space-y-1">
                                  {costBreakdown.internalCosts.studentAccommodation > 0 && (
                                    <tr className="border-b border-red-100">
                                      <td className="py-1">Student Accommodation</td>
                                      <td className="py-1 text-slate-600">
                                        {quote?.numberOfStudents || 0} students × {quote ? parseDuration(quote.duration) : 0} days × €{(parseFloat(quote?.costStudentAccommodationPerDay || "0")).toFixed(2)}
                                      </td>
                                      <td className="py-1 text-right font-medium">€{costBreakdown.internalCosts.studentAccommodation.toFixed(2)}</td>
                                    </tr>
                                  )}
                                  {costBreakdown.internalCosts.teacherAccommodation > 0 && (
                                    <tr className="border-b border-red-100">
                                      <td className="py-1">Teacher Accommodation</td>
                                      <td className="py-1 text-slate-600">
                                        {quote?.numberOfTeachers || 0} teachers × {quote ? parseDuration(quote.duration) : 0} days × €{(parseFloat(quote?.costTeacherAccommodationPerDay || "0")).toFixed(2)}
                                      </td>
                                      <td className="py-1 text-right font-medium">€{costBreakdown.internalCosts.teacherAccommodation.toFixed(2)}</td>
                                    </tr>
                                  )}
                                  {costBreakdown.internalCosts.meals > 0 && (
                                    <tr className="border-b border-red-100">
                                      <td className="py-1">Meals (All)</td>
                                      <td className="py-1 text-slate-600">
                                        {quote?.numberOfStudents + quote?.numberOfTeachers || 0} people × {quote ? parseDuration(quote.duration) : 0} days × €{((parseFloat(quote?.costBreakfastPerDay || "0") + parseFloat(quote?.costLunchPerDay || "0") + parseFloat(quote?.costDinnerPerDay || "0"))).toFixed(2)}
                                      </td>
                                      <td className="py-1 text-right font-medium">€{costBreakdown.internalCosts.meals.toFixed(2)}</td>
                                    </tr>
                                  )}
                                  {costBreakdown.internalCosts.localTransportation > 0 && (
                                    <tr className="border-b border-red-100">
                                      <td className="py-1">Local Transport</td>
                                      <td className="py-1 text-slate-600">
                                        {quote?.numberOfStudents + quote?.numberOfTeachers || 0} people × €{(parseFloat(quote?.costLocalTransportationCard || "0")).toFixed(2)}
                                      </td>
                                      <td className="py-1 text-right font-medium">€{costBreakdown.internalCosts.localTransportation.toFixed(2)}</td>
                                    </tr>
                                  )}
                                  {costBreakdown.internalCosts.coordination > 0 && (
                                    <tr className="border-b border-red-100">
                                      <td className="py-1">Coordination Fees</td>
                                      <td className="py-1 text-slate-600">
                                        {quote?.numberOfStudents || 0} × €{(parseFloat(quote?.costStudentCoordination || "0")).toFixed(2)} + {quote?.numberOfTeachers || 0} × €{(parseFloat(quote?.costTeacherCoordination || "0")).toFixed(2)}
                                      </td>
                                      <td className="py-1 text-right font-medium">€{costBreakdown.internalCosts.coordination.toFixed(2)}</td>
                                    </tr>
                                  )}
                                  {costBreakdown.internalCosts.localCoordinator > 0 && (
                                    <tr className="border-b border-red-100">
                                      <td className="py-1">Local Coordinator</td>
                                      <td className="py-1 text-slate-600">1 trip × €{(parseFloat(quote?.costLocalCoordinator || "0")).toFixed(2)}</td>
                                      <td className="py-1 text-right font-medium">€{costBreakdown.internalCosts.localCoordinator.toFixed(2)}</td>
                                    </tr>
                                  )}
                                  {costBreakdown.internalCosts.airportTransfer > 0 && (
                                    <tr className="border-b border-red-100">
                                      <td className="py-1">Airport Transfers</td>
                                      <td className="py-1 text-slate-600">
                                        {quote?.numberOfStudents + quote?.numberOfTeachers || 0} people × €{(parseFloat(quote?.costAirportTransfer || "0")).toFixed(2)}
                                      </td>
                                      <td className="py-1 text-right font-medium">€{costBreakdown.internalCosts.airportTransfer.toFixed(2)}</td>
                                    </tr>
                                  )}
                                  {costBreakdown.internalCosts.additionalServices > 0 && (
                                    <tr className="border-b border-red-100">
                                      <td className="py-1">Additional Services</td>
                                      <td className="py-1 text-slate-600">Various services</td>
                                      <td className="py-1 text-right font-medium">€{costBreakdown.internalCosts.additionalServices.toFixed(2)}</td>
                                    </tr>
                                  )}
                                  <tr className="border-t-2 border-red-300 font-semibold">
                                    <td className="py-2">Total Internal Costs</td>
                                    <td className="py-2"></td>
                                    <td className="py-2 text-right text-red-800">€{costBreakdown.internalCosts.totalCosts.toFixed(2)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Additional Comments */}
            {quote.additionalComments && quote.additionalComments.trim() && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-900 border-b border-slate-200 pb-2">
                  Additional Information
                </h3>
                <div className="text-slate-700 whitespace-pre-wrap">
                  {quote.additionalComments}
                </div>
              </Card>
            )}

            {/* Next Steps */}
            <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 text-black text-center">
              <h3 className="text-lg font-semibold mb-4">Ready to Transform Your Students' Future?</h3>
              <p className="mb-6 text-gray-800">
                Contact My Abroad Ally to discuss this opportunity and customize the perfect educational experience for {quote.fiscalName}.
              </p>
              
              <div className="space-y-2 text-sm font-medium">
                <p><Phone className="inline mr-2 h-4 w-4" />Contact us for personalized consultation</p>
                <p><Mail className="inline mr-2 h-4 w-4" />maa@myabroadally.com</p>
                <p><Globe className="inline mr-2 h-4 w-4" />www.myabroadally.com</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
