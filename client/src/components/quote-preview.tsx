import { type Quote } from "@shared/schema";
import { calculateQuoteCost, formatCurrency, type AdhocService } from "@shared/costing";

// Helper function to parse duration for calculations
function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 7;
}
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, Printer, Loader2, FileSpreadsheet } from "lucide-react";
import { CheckCircle, GraduationCap, Plane, Phone, Mail, Globe } from "lucide-react";
import logoPath from "@assets/Main Brand Logo_1752655471601.png";
import madrid1 from "@assets/5fa53648e38b2_1752761191307.jpeg";
import madrid2 from "@assets/vistas-palacio-real_1752761191308.avif";
import madrid3 from "@assets/895-adobestock110515761_1752761191309.jpeg";
import madrid4 from "@assets/348698-Madrid_1752761191309.jpg";
import madrid5 from "@assets/0_-_BCC-2023-MADRID-LANDMARKS-0_1752761191309.avif";
import malaga1 from "@assets/centro-pompidou_1752771123519.webp";
import malaga2 from "@assets/ok-la-malagueta_1752771123520.jpg";
import malaga3 from "@assets/feria-malaga.webp";
import malaga4 from "@assets/malaga-cityview.webp";
import alicante1 from "@assets/_methode_times_prod_web_bin_ee791ff0-d38e-11e7-9825-214165100f73_1752773266119.webp";
import alicante2 from "@assets/alicante_1752773266119.jpg";
import alicante3 from "@assets/50849-Playa-San-Juan_1752773266120.webp";
import alicante4 from "@assets/explanada-paseo-alicante_1752773266120.webp";
import bari1 from "@assets/bari1.jpg";
import bari2 from "@assets/bari2.jpg";
import bari3 from "@assets/bari3.jpg";
import bari4 from "@assets/bari4.avif";
import prague1 from "@assets/prague1.avif";
import prague2 from "@assets/prague2.jpg";
import prague3 from "@assets/prague3.png";
import prague4 from "@assets/prague4.avif";
import budapest1 from "@assets/budapest1.jpg";
import budapest2 from "@assets/budapest2.jpg";
import budapest3 from "@assets/budapest3.webp";
import budapest4 from "@assets/budapest4.webp";
import krakow1 from "@assets/Krakow 1_1755169545243.jpg";
import porto1 from "@assets/porto1.jpg";
import porto2 from "@assets/porto2.webp";
import porto3 from "@assets/porto3.jpg";
import porto4 from "@assets/porto4.jpg";
import krakow2 from "@assets/Krakow 2_1755169545243.webp";
import krakow3 from "@assets/Krakow 3_1755169545243.webp";
import krakow4 from "@assets/Krakow 4_1755169545242.jpg";
import dublin1 from "@assets/Dublin 1_1757872030313.webp";
import dublin2 from "@assets/Dublin 2_1757872030313.webp";
import dublin3 from "@assets/Dublin 3_1757872030312.gif";
import dublin4 from "@assets/Dublin 4_1757872030312.jpg";
import valladolid1 from "@assets/Valladolid 1_1755702788593.jpg";
import valladolid2 from "@assets/Valladolid 2_1755702788592.jpg";
import valladolid3 from "@assets/Valladolid 3_1755702788592.jpg";
import valladolid4 from "@assets/Valladolid 4_1755702788591.avif";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState, useEffect } from 'react';

interface QuotePreviewProps {
  quote: Quote | null;
  costBreakdown?: any;
}

export function QuotePreview({ quote, costBreakdown: externalCostBreakdown }: QuotePreviewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);

  // Function to get learning outcomes based on trip type
  const getLearningOutcomes = (tripType: string, customTripType?: string) => {
    // Use custom trip type if trip type is "Other" and custom type is provided
    const effectiveType = tripType === "Other" && customTripType ? customTripType : tripType;
    const type = effectiveType.toLowerCase();
    
    if (type.includes('school exchange')) {
      return {
        title: "Students will gain:",
        outcomes: [
          "Cultural immersion through shared daily life with peers",
          "Improved communication and teamwork in diverse settings", 
          "Exposure to different educational systems and teaching styles",
          "Broader global awareness and intercultural sensitivity",
          "Increased confidence, curiosity, and personal growth"
        ]
      };
    } else if (type.includes('job shadowing')) {
      return {
        title: "Participants will gain:",
        outcomes: [
          "Firsthand insight into European vocational training systems",
          "Understanding of workplace practices and professional standards",
          "Improved cross-cultural collaboration and observation skills", 
          "Broader perspective on teaching methodologies and innovation",
          "Inspiration for adapting new approaches in their own institutions"
        ]
      };
    } else {
      // Default to Work Experience Mobility
      return {
        title: "Students will gain:",
        outcomes: [
          "Professional work experience in European business environment",
          "Cross-cultural communication and adaptability skills",
          "Language skills development (local language basics)",
          "Enhanced global perspective and career readiness",
          "Independence and problem-solving capabilities"
        ]
      };
    }
  };

  // Print PDF with selectable text using iframe approach
  const triggerAutoDownload = async () => {
    if (!quote || isExporting) return;
    
    setIsExporting(true);
    try {
      // Find the quote document element
      const quoteElement = document.getElementById('quote-document');
      if (!quoteElement) {
        console.error('Quote document element not found');
        return;
      }

      // Hide internal analysis sections for cloning
      const internalAnalysisSections = document.querySelectorAll('.internal-analysis-only');
      internalAnalysisSections.forEach((section) => {
        (section as HTMLElement).style.display = 'none';
      });

      // Create hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not access iframe document');
      }

      // Clone all head styles
      const headClone = document.head.cloneNode(true) as HTMLElement;
      
      // Clone quote content
      const quoteClone = quoteElement.cloneNode(true) as HTMLElement;

      // Write iframe document
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          ${headClone.innerHTML}
          <style>
            @page {
              size: A4;
              margin: 12mm;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-shadow: none !important;
            }
            
            html, body {
              background: #fff !important;
              margin: 0 !important;
              padding: 0 !important;
              font-size: 12px !important;
              line-height: 1.4 !important;
            }
            
            #quote-document {
              max-width: none !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 20px !important;
            }
            
            .educational-value {
              break-before: page;
            }
            
            h1, h2, h3 {
              break-after: avoid;
            }
            
            .destination-image, .cost-breakdown {
              break-inside: avoid;
            }
            
            img {
              max-width: 100% !important;
              height: auto !important;
            }
            
            .logo {
              max-width: 160px !important;
              max-height: 80px !important;
            }
          </style>
        </head>
        <body>
          ${quoteClone.outerHTML}
        </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for fonts and images to load
      await new Promise<void>((resolve) => {
        const images = Array.from(iframeDoc.images);
        const fontPromise = (iframeDoc as any).fonts?.ready || Promise.resolve();
        
        const imagePromises = images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        });

        Promise.all([fontPromise, ...imagePromises]).then(() => {
          setTimeout(resolve, 500); // Extra time for rendering
        });
      });

      // Print iframe
      if (iframe.contentWindow) {
        iframe.contentWindow.print();
      }

      // Clean up
      setTimeout(() => {
        document.body.removeChild(iframe);
        // Restore internal sections
        internalAnalysisSections.forEach((section) => {
          (section as HTMLElement).style.display = '';
        });
      }, 1000);
      
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Listen for auto-download event
  useEffect(() => {
    const handleAutoDownload = () => {
      if (quote) {
        triggerAutoDownload();
      }
    };

    document.addEventListener('download-pdf', handleAutoDownload);
    
    return () => {
      document.removeEventListener('download-pdf', handleAutoDownload);
    };
  }, [quote]);
  
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
    } else if (city.includes('malaga') || city.includes('málaga')) {
      return "https://images.unsplash.com/photo-1539650116574-75c0c6d73ded?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('alicante')) {
      return "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('valladolid')) {
      return "https://images.unsplash.com/photo-1562577309-2592ab84b1bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('gijon') || city.includes('gijón')) {
      return "https://images.unsplash.com/photo-1580237541049-2d715a09486e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('barcelona')) {
      return "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // Portugal
    } else if (city.includes('porto')) {
      return "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // France  
    } else if (city.includes('lyon')) {
      return "https://images.unsplash.com/photo-1524863479829-916d8e77f114?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('paris')) {
      return "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // UK & Ireland
    } else if (city.includes('bristol')) {
      return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('dublin')) {
      return dublin1;
    // Italy
    } else if (city.includes('bari')) {
      return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('catania')) {
      return "https://images.unsplash.com/photo-1566313793781-6bf9c8e9e3e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // Czech Republic
    } else if (city.includes('prague')) {
      return "https://images.unsplash.com/photo-1544986581-efac024faf62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // Poland
    } else if (city.includes('krakow') || city.includes('kraków')) {
      return krakow1;
    } else if (city.includes('poznan') || city.includes('poznań')) {
      return "https://images.unsplash.com/photo-1587330979470-3bd2893099f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('warsaw')) {
      return "https://images.unsplash.com/photo-1576976658624-7eb635d39ce4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    // Hungary
    } else if (city.includes('budapest')) {
      return "https://images.unsplash.com/photo-1541697141938-ac7b57ab6df0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
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
    } else if (city.includes('malaga') || city.includes('málaga')) {
      return {
        description: "Málaga stands as southern Spain's cultural and business gateway, where Mediterranean charm meets modern innovation. As the birthplace of Pablo Picasso and home to world-class museums including the Pompidou Centre, students experience exceptional artistic and cultural immersion. The city's vibrant tech sector and entrepreneurial ecosystem provide insights into Spain's digital transformation and startup culture. Students explore the historic Alcazaba fortress and Roman Theatre, discovering Spain's rich multicultural heritage from Moorish rule to modern times. The beautiful coastline and traditional Andalusian culture create an engaging environment for language learning and cultural exchange, while the modern port and tourism industry offer practical business insights into Mediterranean economic development.",
        images: [
          { src: malaga1, alt: "Pompidou Centre Málaga" },
          { src: malaga2, alt: "La Malagueta Beach" },
          { src: malaga3, alt: "Feria de Málaga festival" },
          { src: malaga4, alt: "Historic Málaga cityview" }
        ]
      };
    } else if (city.includes('alicante')) {
      return {
        description: "Alicante offers students a unique Mediterranean experience where innovation meets tradition along Spain's beautiful Costa Blanca. As a growing tech hub with expanding university research facilities, students connect with Spain's emerging digital economy and startup culture. The city's sustainable tourism practices and marine conservation efforts provide practical insights into environmental responsibility and coastal management. Students experience the distinctive Valencian culture and bilingual environment, enhancing both Spanish and Valencian language skills while building cultural understanding. The historic Santa Bárbara Castle and modern port operations offer lessons in Mediterranean trade history and contemporary logistics, making Alicante an ideal destination for comprehensive educational travel that combines business innovation, cultural immersion, and environmental awareness.",
        images: [
          { src: alicante1, alt: "Colorful historic quarter of Alicante" },
          { src: alicante2, alt: "Aerial view of Alicante port and city" },
          { src: alicante3, alt: "Playa San Juan beautiful coastline" },
          { src: alicante4, alt: "Explanada de España palm-lined promenade" }
        ]
      };
    } else if (city.includes('valladolid')) {
      return {
        description: "Valladolid stands as the birthplace of Spanish language and literature, offering students unparalleled language immersion in this historic Castilian city. As a major automotive industry center, students visit Renault and other manufacturing facilities to understand Spain's industrial transformation and modern production methods. The city's authentic university town atmosphere provides opportunities to experience genuine Spanish student life at one of the country's oldest institutions, fostering meaningful academic and cultural exchange. Students explore Renaissance and Baroque architecture from Spain's Golden Age, connecting imperial history with contemporary Spanish identity. This combination of linguistic heritage, industrial innovation, academic tradition, and architectural splendor makes Valladolid an exceptional destination for comprehensive educational travel.",
        images: [
          { src: valladolid1, alt: "Santa María la Antigua Church and historic architecture" },
          { src: valladolid2, alt: "Peñafiel Castle overlooking traditional Spanish village" },
          { src: valladolid3, alt: "Plaza Mayor with historic Town Hall and monument" },
          { src: valladolid4, alt: "Golden Age Renaissance architecture" }
        ]
      };
    } else if (city.includes('gijon')) {
      return {
        description: "Gijón provides students with an exceptional window into Spain's maritime heritage and industrial evolution as a vibrant northern port city. Students explore the country's naval history and modern fishing industry, understanding how traditional seafaring has adapted to contemporary economic demands. The city's Industrial Revolution legacy offers fascinating insights into Spain's development through steel production and mining heritage, with historic industrial sites now transformed into engaging cultural and educational spaces. As part of Green Spain, Gijón showcases sustainable practices and environmental awareness initiatives, promoting ecological education and climate consciousness. The unique Asturian culture blends Celtic traditions with Roman archaeological heritage, broadening students' historical perspectives and cultural understanding beyond typical Spanish experiences.",
        images: [
          { src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Gijón maritime port" },
          { src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Industrial heritage" },
          { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Green Spain landscape" },
          { src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Asturian cultural heritage" }
        ]
      };
    }
    // PORTUGAL
    else if (city.includes('porto')) {
      return {
        description: "Porto offers students an extraordinary educational experience in Portugal's UNESCO World Heritage historic center, where centuries-old architecture, traditional azulejo tiles, and exemplary urban planning preservation create living lessons in cultural heritage management. Students visit the world-famous port wine cellars to understand Portuguese export traditions and discover how family businesses have thrived across generations, building international brands and maintaining quality standards. As Portugal's emerging tech and innovation hub, Porto showcases a dynamic startup ecosystem that positions the country as a modern European innovation center, blending traditional industries with cutting-edge technology. The city's rich maritime exploration legacy connects students to the Portuguese Age of Discovery while exploring today's modern shipping industry, making Porto an ideal destination for comprehensive cultural, business, and historical education.",
        images: [
          { src: porto1, alt: "Porto historic waterfront" },
          { src: porto2, alt: "Livraria Lello bookstore" },
          { src: porto3, alt: "Dom Luís I Bridge" },
          { src: porto4, alt: "São Bento Station azulejos" }
        ]
      };
    }
    // FRANCE
    else if (city.includes('lyon')) {
      return {
        description: "Lyon stands as France's undisputed culinary capital, offering students an immersive experience in world-renowned gastronomy while learning about French culinary traditions, food science, and hospitality management from master chefs and industry professionals. The city's remarkable silk industry heritage provides insights into Lyon's historical role in textile innovation, connecting traditional French crafts with contemporary design and manufacturing excellence. As a leading biotech and pharmaceutical hub, Lyon showcases France's advancement in life sciences and medical research, inspiring students interested in healthcare careers and scientific innovation. Students explore Vieux Lyon's Renaissance architecture and UNESCO World Heritage sites, gaining deep understanding of French architectural history and urban development principles that have influenced cities worldwide.",
        images: [
          { src: "https://images.unsplash.com/photo-1524863479829-916d8e77f114?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Lyon gastronomy" },
          { src: "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Silk heritage" },
          { src: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Biotech research" },
          { src: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Renaissance architecture" }
        ]
      };
    } else if (city.includes('paris')) {
      return {
        description: "Paris provides students with unparalleled access to global business and European commerce as France's economic capital, featuring visits to multinational headquarters and prestigious financial institutions that shape international markets. Students explore world-famous Parisian fashion houses and design studios, gaining insight into France's leadership in luxury goods and creative industries that set global trends. The city's incomparable cultural heritage includes visits to renowned museums and landmarks, offering immersive experiences in French art, history, and cultural preservation that have influenced civilization. Paris's rapidly growing tech ecosystem and innovation districts demonstrate how the city successfully connects traditional excellence with digital transformation, making it an exceptional destination for comprehensive business, cultural, and technological education.",
        images: [
          { src: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Paris business district" },
          { src: "https://images.unsplash.com/photo-1471623432079-b009d30b6729?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Cultural heritage" },
          { src: "https://images.unsplash.com/photo-1522582324369-2dfc36bd9275?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "EU diplomacy" },
          { src: "https://images.unsplash.com/photo-1549144511-f099e773c147?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Tech innovation" }
        ]
      };
    }
    // UK & Ireland
    else if (city.includes('bristol')) {
      return {
        description: "Bristol provides students with exceptional access to British aerospace innovation through visits to Airbus facilities, where they learn about engineering design, sustainable aviation technology, and the UK's leadership in aerospace manufacturing. The city's fascinating maritime trading history offers insights into historical commerce while exploring modern sustainable business practices and ethical trading principles. Students discover Bristol's thriving creative and digital industries, from BBC production facilities to cutting-edge video game development studios and digital media companies that shape British entertainment. As a former European Green Capital, Bristol showcases environmental sustainability initiatives and green technology innovations, promoting ecological awareness and sustainable development practices among students.",
        images: [
          { src: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Bristol aerospace" },
          { src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Maritime heritage" },
          { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Creative industries" },
          { src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", alt: "Green initiatives" }
        ]
      };
    } else if (city.includes('dublin')) {
      return {
        description: "Dublin offers students an immersive experience in Ireland's vibrant capital, where literary heritage meets modern innovation and European business leadership. Students explore the historic Trinity College and its famous Old Library, home to the Book of Kells, while discovering Ireland's rich literary tradition through the Dublin Writers Museum and the footsteps of Joyce, Wilde, and Shaw. The city's thriving tech sector, known as the 'Silicon Docks,' provides insights into how Ireland became Europe's technology hub, hosting European headquarters for major global companies. Students experience authentic Irish culture through traditional music sessions in historic Temple Bar, while learning about Ireland's journey from agricultural nation to modern knowledge economy. The Georgian architecture and cobblestone streets tell the story of Dublin's colonial past and its transformation into a cosmopolitan European capital.",
        images: [
          { src: dublin1, alt: "Colorful Dublin street scene with traditional shops" },
          { src: dublin2, alt: "Dublin River Liffey with bridges and cityscape" },
          { src: dublin3, alt: "The Temple Bar pub with traditional red facade" },
          { src: dublin4, alt: "Trinity College Dublin with iconic bell tower" }
        ]
      };
    }
    // ITALY
    else if (city.includes('bari')) {
      return {
        description: "Bari offers students an authentic Southern Italian experience in Puglia's vibrant capital, where maritime traditions blend with modern Mediterranean culture. Students explore the historic fishing harbor and experience the traditional Adriatic coastal lifestyle, learning about sustainable fishing practices and maritime commerce that have sustained local communities for centuries. The city's crystalline waters and ancient fortifications tell the story of Bari's strategic importance as Italy's gateway to the Balkans and Eastern Europe, connecting students to centuries of cross-cultural exchange and trade networks. Students discover authentic Pugliese culinary traditions through hands-on pasta making workshops with local artisans, learning the time-honored techniques of orecchiette preparation while understanding the region's agricultural heritage and farm-to-table movement that defines Southern Italian gastronomy.",
        images: [
          { src: bari1, alt: "Historic fishing harbor with colorful boats" },
          { src: bari2, alt: "Crystal clear waters and ancient coastal walls" },
          { src: bari3, alt: "Traditional pasta making workshop" },
          { src: bari4, alt: "Adriatic gateway architecture" }
        ]
      };
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
      return {
        description: "Prague offers students an extraordinary educational experience in the heart of Europe, where over 1000 years of Gothic, Renaissance, and Baroque architecture tell the story of Central European history and cultural development. Students explore one of the world's best-preserved medieval cities while discovering how Prague has transformed into Eastern Europe's Silicon Valley, hosting thriving tech startups, game development studios, and international business centers that drive modern Czech innovation. The city provides authentic insights into Czech cultural heritage through traditional cuisine, music, and customs, while learning about the country's peaceful Velvet Revolution and successful transition to democracy and EU membership. Prague's strategic position as Central Europe's gateway offers students valuable lessons in regional business culture, EU economic integration, and the dynamic relationship between historical preservation and modern European development.",
        images: [
          { src: prague1, alt: "Historic Prague Castle and Gothic architecture" },
          { src: prague2, alt: "Prague bridges and autumn foliage cityscape" },
          { src: prague3, alt: "Students enjoying riverside Prague views" },
          { src: prague4, alt: "Modern Prague university and education district" }
        ]
      };
    }
    // POLAND
    else if (city.includes('krakow') || city.includes('kraków')) {
      return {
        description: "Kraków offers students an extraordinary educational experience in Poland's historic royal capital, where medieval architecture and UNESCO World Heritage sites create an unparalleled backdrop for learning about Central European history and culture. Students explore the magnificent Main Market Square, one of Europe's largest and most beautiful medieval squares, while discovering how Kraków has maintained its role as Poland's cultural and intellectual center through centuries of political change. The city provides authentic insights into Polish traditions, language, and customs, while visits to the historic Jagiellonian University - where Copernicus studied - inspire scientific curiosity and academic excellence. Kraków's strategic position as a gateway between Western and Eastern Europe offers students valuable lessons in regional politics, EU integration, and the dynamic transformation of post-communist countries into modern European democracies.",
        images: [
          { src: krakow1, alt: "Historic Kraków Main Market Square evening illumination" },
          { src: krakow2, alt: "Iconic sculpture in Kraków's medieval market square" },
          { src: krakow3, alt: "Wawel Castle towers and Gothic architecture" },
          { src: krakow4, alt: "Aerial view of Wawel Royal Castle complex" }
        ]
      };
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
      return {
        description: "Budapest provides students with an immersive educational experience in Central Europe's most captivating capital, where the majestic Danube River divides historic Buda from cosmopolitan Pest, creating stunning panoramic views that demonstrate urban planning excellence across centuries. Students explore the magnificent architecture of the former Austro-Hungarian Empire through iconic parliament buildings, royal palaces, and grand boulevards that tell the story of Central European political and cultural development. The city's famous thermal bath culture offers unique insights into traditional Hungarian wellness practices and modern wellness tourism, while Budapest's transformation into a thriving tech and innovation hub showcases Hungary's successful digital modernization and EU technology integration. Through visits to startups, cultural institutions, and historic sites, students gain comprehensive understanding of how this remarkable city bridges its imperial past with its dynamic European future.",
        images: [
          { src: budapest1, alt: "Budapest Parliament and Danube River panoramic view" },
          { src: budapest2, alt: "Hungarian Parliament Building with historic monument" },
          { src: budapest3, alt: "Famous Széchenyi thermal baths complex" },
          { src: budapest4, alt: "Budapest Opera House evening illumination" }
        ]
      };
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
      
      // Enhanced approach: Higher scale for crisp text while maintaining reasonable file size
      const canvas = await html2canvas(quoteElement, {
        scale: 2.0, // Higher scale for crisp text rendering
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 10000,
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
                img.style.width = '140px'; // Slightly larger for better quality
                img.style.height = '105px'; 
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
      const imgData = canvas.toDataURL('image/jpeg', 0.92); // Higher quality for crisp text
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
          const pageData = pageCanvas.toDataURL('image/jpeg', 0.92); // Higher quality for better text clarity
          pdf.addImage(pageData, 'JPEG', 15, 15, pdfWidth, heightToAdd);
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

  const handleExportGoogleSheets = async () => {
    if (!quote || isExportingSheets) return;
    
    setIsExportingSheets(true);
    try {
      console.log('Starting Google Sheets export for quote:', quote.quoteNumber);
      console.log('Cost breakdown data:', costBreakdown);
      
      // Ensure costBreakdown exists
      if (!costBreakdown) {
        throw new Error('Cost breakdown data is not available');
      }
      
      // Create comprehensive spreadsheet data including all internal calculations
      const spreadsheetData = {
        // Basic Quote Information
        quoteInfo: {
          'Quote Number': quote.quoteNumber,
          'Date Created': new Date(quote.createdAt).toLocaleDateString(),
          'Client Name': quote.fiscalName,
          'Email': quote.email,
          'Tax ID': quote.taxId || 'N/A',
          'Country': quote.country,
          'City': quote.city,
          'Postcode': quote.postcode || 'N/A',
          'Address': quote.address || 'N/A'
        },
        
        // Trip Details
        tripDetails: {
          'Destination': quote.destination,
          'Trip Type': quote.tripType,
          'Start Date': quote.startDate,
          'End Date': quote.endDate,
          'Duration': quote.duration,
          'Number of Students': quote.numberOfStudents,
          'Number of Teachers': quote.numberOfTeachers,
          'Total Participants': quote.numberOfStudents + quote.numberOfTeachers
        },
        
        // Accommodation
        accommodation: {
          'Student Accommodation Name': quote.studentAccommodationName || 'N/A',
          'Student Accommodation Price/Day': `€${parseFloat(quote.studentAccommodationPerDay || "0").toFixed(2)}`,
          'Teacher Accommodation Name': quote.teacherAccommodationName || 'N/A', 
          'Teacher Accommodation Price/Day': `€${parseFloat(quote.teacherAccommodationPerDay || "0").toFixed(2)}`
        },
        
        // Meals
        meals: {
          'Breakfast Price/Day': `€${parseFloat(quote.breakfastPerDay || "0").toFixed(2)}`,
          'Lunch Price/Day': `€${parseFloat(quote.lunchPerDay || "0").toFixed(2)}`,
          'Dinner Price/Day': `€${parseFloat(quote.dinnerPerDay || "0").toFixed(2)}`
        },
        
        // Other Services
        services: {
          'Transport Card Total': `€${parseFloat(quote.transportCardTotal || "0").toFixed(2)}`,
          'Student Coordination Fee Total': `€${parseFloat(quote.studentCoordinationFeeTotal || "0").toFixed(2)}`,
          'Teacher Coordination Fee Total': `€${parseFloat(quote.teacherCoordinationFeeTotal || "0").toFixed(2)}`,
          'Airport Transfer Per Person': `€${parseFloat(quote.airportTransferPerPerson || "0").toFixed(2)}`
        },
        
        // Customer Pricing
        customerPricing: {
          'Price Per Student': `€${parseFloat(quote.pricePerStudent || "0").toFixed(2)}`,
          'Price Per Teacher': `€${parseFloat(quote.pricePerTeacher || "0").toFixed(2)}`,
          'Total Student Revenue': `€${(parseFloat(quote.pricePerStudent || "0") * quote.numberOfStudents).toFixed(2)}`,
          'Total Teacher Revenue': `€${(parseFloat(quote.pricePerTeacher || "0") * quote.numberOfTeachers).toFixed(2)}`,
          'Total Revenue': `€${((parseFloat(quote.pricePerStudent || "0") * quote.numberOfStudents) + (parseFloat(quote.pricePerTeacher || "0") * quote.numberOfTeachers)).toFixed(2)}`
        },
        
        // Internal Cost Analysis
        internalCosts: {
          'Student Accommodation Cost': `€${(costBreakdown.internalCosts?.studentAccommodation || 0).toFixed(2)}`,
          'Teacher Accommodation Cost': `€${(costBreakdown.internalCosts?.teacherAccommodation || 0).toFixed(2)}`,
          'Meals Cost': `€${(costBreakdown.internalCosts?.meals || 0).toFixed(2)}`,
          'Local Transportation Cost': `€${(costBreakdown.internalCosts?.localTransportation || 0).toFixed(2)}`,
          'Coordination Fees Cost': `€${(costBreakdown.internalCosts?.coordination || 0).toFixed(2)}`,
          'Local Coordinator Cost': `€${(costBreakdown.internalCosts?.localCoordinator || 0).toFixed(2)}`,
          'Airport Transfer Cost': `€${(costBreakdown.internalCosts?.airportTransfer || 0).toFixed(2)}`,
          'Additional Services Cost': `€${(costBreakdown.internalCosts?.additionalServices || 0).toFixed(2)}`,
          'Total Internal Costs': `€${(costBreakdown.internalCosts?.totalCosts || 0).toFixed(2)}`
        },
        
        // Profitability Analysis
        profitability: {
          'Total Revenue': `€${(costBreakdown.revenue?.total || 0).toFixed(2)}`,
          'Total Costs': `€${(costBreakdown.internalCosts?.totalCosts || 0).toFixed(2)}`,
          'Gross Profit': `€${(costBreakdown.profit?.gross || 0).toFixed(2)}`,
          'Net Profit (after VAT)': `€${(costBreakdown.profit?.net || 0).toFixed(2)}`,
          'Average Profit per Traveller': `€${(costBreakdown.profit?.averagePerTraveller || 0).toFixed(2)}`,
          'Gross Margin': `${(costBreakdown.profit?.grossMargin || 0).toFixed(1)}%`,
          'Net Margin': `${(costBreakdown.profit?.netMargin || 0).toFixed(1)}%`
        },
        
        // Erasmus+ Funding (if available)
        erasmusFunding: costBreakdown.erasmusFunding ? {
          'Country Group': costBreakdown.erasmusFunding.countryGroup || 'N/A',
          'Student Funding (Days 1-14)': `€${(costBreakdown.erasmusFunding.student?.days1to14 || 0).toFixed(2)}`,
          'Student Funding (Days 15+)': `€${(costBreakdown.erasmusFunding.student?.days15plus || 0).toFixed(2)}`,
          'Total Student Funding': `€${(costBreakdown.erasmusFunding.student?.total || 0).toFixed(2)}`,
          'Teacher Funding (Days 1-14)': `€${(costBreakdown.erasmusFunding.teacher?.days1to14 || 0).toFixed(2)}`,
          'Teacher Funding (Days 15+)': `€${(costBreakdown.erasmusFunding.teacher?.days15plus || 0).toFixed(2)}`,
          'Total Teacher Funding': `€${(costBreakdown.erasmusFunding.teacher?.total || 0).toFixed(2)}`,
          'Total Available Funding': `€${(costBreakdown.erasmusFunding.total || 0).toFixed(2)}`
        } : {},
        
        // Additional Information
        additional: {
          'Additional Comments': quote.additionalComments || 'None'
        }
      };

      // Convert to CSV format for Google Sheets compatibility
      let csvContent = '';
      
      // Add each section
      Object.entries(spreadsheetData).forEach(([sectionName, sectionData]) => {
        if (Object.keys(sectionData).length > 0) {
          csvContent += `\n${sectionName.toUpperCase()}\n`;
          csvContent += 'Field,Value\n';
          Object.entries(sectionData).forEach(([key, value]) => {
            csvContent += `"${key}","${value}"\n`;
          });
        }
      });

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${quote.quoteNumber}_${quote.fiscalName.replace(/\s+/g, '_')}_${quote.destination.replace(/\s+/g, '_')}_Complete_Analysis.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error generating Google Sheets export:', error);
      alert('Failed to generate Google Sheets export. Please try again.');
    } finally {
      setIsExportingSheets(false);
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
                variant="outline" 
                size="sm" 
                onClick={handleExportGoogleSheets}
                disabled={isExportingSheets}
                className="text-green-600 border-green-600 hover:bg-green-50 disabled:opacity-50"
              >
                {isExportingSheets ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                {isExportingSheets ? 'Exporting...' : 'Export Sheets'}
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
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  {quote.tripType === "Other" && quote.customTripType ? quote.customTripType : quote.tripType} • Quote created: {new Date(quote.createdAt).toLocaleDateString()}
                </h2>
                <h3 className="text-lg text-primary font-medium">{quote.destination}</h3>
              </div>
              
              <div className="flex justify-center gap-8">
                {/* Customer Info */}
                <Card className="bg-slate-50 p-4 max-w-md w-full">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">School:</span>
                      <span className="text-slate-600 text-right">{quote.fiscalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Contact:</span>
                      <span className="text-slate-600 text-right">{quote.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">City:</span>
                      <span className="text-slate-600 text-right">{quote.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Country:</span>
                      <span className="text-slate-600 text-right">{quote.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Address:</span>
                      <span className="text-slate-600 text-xs text-right">{quote.address}</span>
                    </div>
                  </div>
                </Card>
                
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
                    highlights.images.slice(0, 4).map((image, index) => (
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
                {(() => {
                  const learningOutcomes = getLearningOutcomes(quote?.tripType || '', quote?.customTripType);
                  return (
                    <>
                      <h4 className="font-semibold text-blue-900 mb-4">{learningOutcomes.title}</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                        {learningOutcomes.outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="text-blue-600 mr-3 mt-0.5 h-4 w-4" />
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  );
                })()}
              </Card>
            </div>

            {/* Pricing Summary - Add extra spacing to prevent page split */}
            <div className="mb-12 mt-16" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <h3 className="text-xl font-semibold text-slate-900 mb-6 border-b-2 border-primary pb-2" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
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
                            {adhocServices.map((service, index) => {
                              // Use backward compatibility for participant counts
                              const studentCount = service.studentCount !== undefined ? service.studentCount : quote.numberOfStudents;
                              const teacherCount = service.teacherCount !== undefined ? service.teacherCount : quote.numberOfTeachers;
                              const totalParticipants = studentCount + teacherCount;
                              
                              return (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">{service.name}</span>
                                    <span className="text-slate-700">
                                      {formatCurrency(service.pricePerPerson * totalParticipants)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 ml-2">
                                    {studentCount > 0 && `${studentCount} student${studentCount !== 1 ? 's' : ''}`}
                                    {studentCount > 0 && teacherCount > 0 && ' + '}
                                    {teacherCount > 0 && `${teacherCount} teacher${teacherCount !== 1 ? 's' : ''}`}
                                    {` × €${service.pricePerPerson.toFixed(2)} = €${(service.pricePerPerson * totalParticipants).toFixed(2)}`}
                                  </div>
                                </div>
                              );
                            })}
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
                    <div className="internal-analysis-only border-t border-slate-300 pt-6">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                        <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                          <div className="w-3 h-3 bg-red-600 rounded-full mr-3"></div>
                          Internal Profitability Analysis
                        </h4>
                        
                        {/* Revenue & Costs Overview */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="text-sm text-green-700 font-medium mb-1">Total Revenue</div>
                            <div className="text-2xl font-bold text-green-800">
                              {formatCurrency(costBreakdown.profitability.revenue)}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              {quote?.numberOfStudents} students + {quote?.numberOfTeachers} teachers
                            </div>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="text-sm text-red-700 font-medium mb-1">Total Internal Costs</div>
                            <div className="text-2xl font-bold text-red-800">
                              {formatCurrency(costBreakdown.profitability.costs)}
                            </div>
                            <div className="text-xs text-red-600 mt-1">
                              All operational expenses
                            </div>
                          </div>
                        </div>
                        
                        {/* Profit Calculation */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
                          <h5 className="text-md font-semibold text-slate-800 mb-4">Profit Calculation</h5>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                              <span className="text-slate-700 font-medium">Gross Profit</span>
                              <span className={`text-lg font-bold ${costBreakdown.profitability.grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatCurrency(costBreakdown.profitability.grossProfit)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                              <span className="text-slate-700">Less: VAT (21%)</span>
                              <span className="text-orange-600 font-semibold">
                                -{formatCurrency(costBreakdown.profitability.vat)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-t-2 border-slate-300 bg-slate-50 px-2 rounded">
                              <span className="text-slate-800 font-bold">Net Profit</span>
                              <span className={`text-xl font-bold ${costBreakdown.profitability.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatCurrency(costBreakdown.profitability.netProfit)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Key Metrics */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                            <div className="text-xs text-blue-700 font-medium mb-1">Average Profit per Traveller</div>
                            <div className={`text-lg font-bold ${(() => {
                              if (!quote || (quote.numberOfStudents + quote.numberOfTeachers) === 0) return 'text-red-700';
                              const avgProfit = costBreakdown.profitability.netProfit / (quote.numberOfStudents + quote.numberOfTeachers);
                              return avgProfit >= 0 ? 'text-green-700' : 'text-red-700';
                            })()}`}>
                              {quote && (quote.numberOfStudents + quote.numberOfTeachers) > 0 ? (() => {
                                const avgProfit = costBreakdown.profitability.netProfit / (quote.numberOfStudents + quote.numberOfTeachers);
                                return formatCurrency(avgProfit);
                              })() : '€0'}
                            </div>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                            <div className="text-xs text-yellow-700 font-medium mb-1">Gross Margin</div>
                            <div className={`text-lg font-bold ${costBreakdown.profitability.grossMarginPercentage >= 30 ? 'text-green-700' : costBreakdown.profitability.grossMarginPercentage >= 15 ? 'text-yellow-600' : 'text-red-700'}`}>
                              {costBreakdown.profitability.grossMarginPercentage.toFixed(1)}%
                            </div>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                            <div className="text-xs text-purple-700 font-medium mb-1">Net Margin</div>
                            <div className={`text-lg font-bold ${costBreakdown.profitability.netMarginPercentage >= 20 ? 'text-green-700' : costBreakdown.profitability.netMarginPercentage >= 10 ? 'text-yellow-600' : 'text-red-700'}`}>
                              {costBreakdown.profitability.netMarginPercentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Detailed Cost Breakdown */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                          <h5 className="text-md font-semibold text-slate-800 mb-4">Detailed Cost Breakdown</h5>
                          <div className="space-y-3">
                            {costBreakdown.internalCosts.studentAccommodation > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div>
                                  <div className="font-medium">Student Accommodation</div>
                                  <div className="text-sm text-slate-500">
                                    {quote?.numberOfStudents || 0} students × {quote ? parseDuration(quote.duration) : 0} days × €{(parseFloat(quote?.costStudentAccommodationPerDay || "0")).toFixed(2)}
                                  </div>
                                </div>
                                <div className="font-semibold">€{costBreakdown.internalCosts.studentAccommodation.toFixed(2)}</div>
                              </div>
                            )}
                            {costBreakdown.internalCosts.teacherAccommodation > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div>
                                  <div className="font-medium">Teacher Accommodation</div>
                                  <div className="text-sm text-slate-500">
                                    {quote?.numberOfTeachers || 0} teachers × {quote ? parseDuration(quote.duration) : 0} days × €{(parseFloat(quote?.costTeacherAccommodationPerDay || "0")).toFixed(2)}
                                  </div>
                                </div>
                                <div className="font-semibold">€{costBreakdown.internalCosts.teacherAccommodation.toFixed(2)}</div>
                              </div>
                            )}
                            {costBreakdown.internalCosts.meals > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div>
                                  <div className="font-medium">Meals</div>
                                  <div className="text-sm text-slate-500">
                                    {quote?.numberOfStudents + quote?.numberOfTeachers || 0} people × {quote ? parseDuration(quote.duration) : 0} days
                                  </div>
                                </div>
                                <div className="font-semibold">€{costBreakdown.internalCosts.meals.toFixed(2)}</div>
                              </div>
                            )}
                            {costBreakdown.internalCosts.localTransportation > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div>
                                  <div className="font-medium">Local Transportation</div>
                                  <div className="text-sm text-slate-500">
                                    {quote?.numberOfStudents + quote?.numberOfTeachers || 0} people × €{(parseFloat(quote?.costLocalTransportationCard || "0")).toFixed(2)}
                                  </div>
                                </div>
                                <div className="font-semibold">€{costBreakdown.internalCosts.localTransportation.toFixed(2)}</div>
                              </div>
                            )}
                            {costBreakdown.internalCosts.coordination > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div>
                                  <div className="font-medium">Coordination Fees</div>
                                  <div className="text-sm text-slate-500">Student and teacher coordination</div>
                                </div>
                                <div className="font-semibold">€{costBreakdown.internalCosts.coordination.toFixed(2)}</div>
                              </div>
                            )}
                            {costBreakdown.internalCosts.localCoordinator > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div>
                                  <div className="font-medium">Local Coordinator</div>
                                  <div className="text-sm text-slate-500">1 trip × €{(parseFloat(quote?.costLocalCoordinator || "0")).toFixed(2)}</div>
                                </div>
                                <div className="font-semibold">€{costBreakdown.internalCosts.localCoordinator.toFixed(2)}</div>
                              </div>
                            )}
                            {costBreakdown.internalCosts.airportTransfer > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div>
                                  <div className="font-medium">Airport Transfers</div>
                                  <div className="text-sm text-slate-500">
                                    {quote?.numberOfStudents + quote?.numberOfTeachers || 0} people × €{(parseFloat(quote?.costAirportTransfer || "0")).toFixed(2)}
                                  </div>
                                </div>
                                <div className="font-semibold">€{costBreakdown.internalCosts.airportTransfer.toFixed(2)}</div>
                              </div>
                            )}
                            {costBreakdown.internalCosts.additionalServices > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div>
                                  <div className="font-medium">Additional Services</div>
                                  <div className="text-sm text-slate-500">Various services</div>
                                </div>
                                <div className="font-semibold">€{costBreakdown.internalCosts.additionalServices.toFixed(2)}</div>
                              </div>
                            )}
                            <div className="flex justify-between items-center py-3 border-t-2 border-slate-300 bg-slate-50 px-2 rounded">
                              <div className="font-bold text-slate-800">Total Internal Costs</div>
                              <div className="font-bold text-lg text-slate-800">€{costBreakdown.internalCosts.totalCosts.toFixed(2)}</div>
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
            {/* Disclaimer */}
            <div className="mt-4 p-4 bg-slate-100 border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-600 text-center leading-relaxed">
                Please note that accommodation and service prices, as well as availability, are subject to change until final confirmation and booking. We recommend early confirmation to secure the quoted rates and options.
              </p>
            </div>

            {/* Payment Conditions Section */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-800 mb-3 text-center">Payment Conditions – My Abroad Ally</h4>
              <div className="space-y-2 text-xs text-yellow-700 leading-relaxed">
                <p>• A 30% deposit is required at the time of booking.</p>
                <p>• The remaining 70% is due one week before the start of the program/trip.</p>
                <p>• Some accommodation providers require full prepayment earlier than one week before arrival. In those cases, My Abroad Ally will inform the school, and the accommodation cost will need to be covered at the time required by the provider in order to secure the reservation.</p>
              </div>
            </div>

            {/* Contact Information - Moved to Bottom */}
            <Card className="mt-4 bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 text-black text-center">
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
