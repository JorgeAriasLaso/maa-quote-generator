import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Quote } from "@shared/schema";
import { calculateQuoteCost, formatCurrency, parseDuration, type AdhocService } from "@shared/costing";
import logoPath from "@assets/Main Brand Logo_1752655471601.png";

// parseDuration is now imported from shared/costing

// Import all destination images
import madrid1 from "@assets/5fa53648e38b2_1752761191307.jpeg";
import madrid2 from "@assets/vistas-palacio-real_1752761191308.avif";
import madrid3 from "@assets/895-adobestock110515761_1752761191309.jpeg";
import madrid4 from "@assets/348698-Madrid_1752761191309.jpg";
import malaga1 from "@assets/centro-pompidou_1752771123519.webp";
import malaga2 from "@assets/ok-la-malagueta_1752771123520.jpg";
import malaga3 from "@assets/feria-malaga.webp";
import malaga4 from "@assets/malaga-cityview.webp";
import alicante1 from "@assets/_methode_times_prod_web_bin_ee791ff0-d38e-11e7-9825-214165100f73_1752773266119.webp";
import alicante2 from "@assets/alicante_1752773266119.jpg";
import alicante3 from "@assets/50849-Playa-San-Juan_1752773266120.webp";
import alicante4 from "@assets/explanada-paseo-alicante_1752773266120.webp";
import dublin1 from "@assets/Dublin 1_1757872030313.webp";
import dublin2 from "@assets/Dublin 2_1757872030313.webp";
import dublin3 from "@assets/Dublin 3_1757872030312.gif";
import dublin4 from "@assets/Dublin 4_1757872030312.jpg";

export default function QuotePrint() {
  const { id } = useParams();
  
  const { data: quote, isLoading } = useQuery<Quote>({
    queryKey: ["/api/quotes", id],
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading quote...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-red-600">Quote not found</div>
      </div>
    );
  }

  // Calculate cost breakdown with proper error handling
  let adhocServices: AdhocService[] = [];
  try {
    adhocServices = quote.adhocServices ? JSON.parse(quote.adhocServices) : [];
  } catch (error) {
    console.error("Failed to parse adhoc services:", error);
    adhocServices = [];
  }
  
  // Ensure quote has valid destination before calculating costs
  if (!quote.destination || typeof quote.destination !== 'string') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-red-600">Invalid quote data - missing destination</div>
      </div>
    );
  }

  // Map quote data to cost calculation parameters
  const customPricing = {
    studentAccommodationPerDay: parseFloat(quote.studentAccommodationPerDay || "0"),
    teacherAccommodationPerDay: parseFloat(quote.teacherAccommodationPerDay || "0"),
    breakfastPerDay: parseFloat(quote.breakfastPerDay || "0"),
    lunchPerDay: parseFloat(quote.lunchPerDay || "0"),
    dinnerPerDay: parseFloat(quote.dinnerPerDay || "0"),
    transportCardTotal: parseFloat(quote.transportCardTotal || "0"),
    studentCoordinationFeeTotal: parseFloat(quote.coordinationFeePerDay || "0") * parseDuration(quote.duration || "7"),
    teacherCoordinationFeeTotal: parseFloat(quote.coordinationFeePerDay || "0") * parseDuration(quote.duration || "7"),
    airportTransferPerPerson: parseFloat(quote.airportTransferPerPerson || "0")
  };
  
  const costBreakdown = calculateQuoteCost(
    quote.destination,
    quote.duration,
    quote.numberOfStudents,
    quote.numberOfTeachers,
    adhocServices,
    customPricing
  );

  // Get destination image
  const getDestinationImage = (destination: string) => {
    const city = destination.toLowerCase();
    if (city.includes('madrid')) return madrid1;
    if (city.includes('málaga') || city.includes('malaga')) return malaga1;
    if (city.includes('alicante')) return alicante1;
    if (city.includes('dublin')) return dublin1;
    return madrid1; // default
  };

  // Get destination highlights
  const getDestinationHighlights = (destination: string) => {
    const city = destination.toLowerCase();
    
    if (city.includes('madrid')) {
      return {
        description: "Madrid offers students an immersive experience in Spain's dynamic capital, where royal heritage meets modern innovation and European leadership. Students explore the magnificent Royal Palace and world-class Prado Museum while discovering Spain's central role in European politics and culture. The city's thriving business districts provide insights into Spain's growing economy and its position as a gateway between Europe and Latin America. Students experience authentic Spanish culture through flamenco performances, traditional tapas culture, and the famous El Retiro Park, while learning about Spain's transition to democracy and its influential role in the European Union.",
        images: [
          { src: madrid1, alt: "Royal Palace of Madrid with classical architecture" },
          { src: madrid2, alt: "Prado Museum and cultural district" },
          { src: madrid3, alt: "Modern Madrid business and shopping areas" },
          { src: madrid4, alt: "El Retiro Park and green spaces" }
        ]
      };
    } else if (city.includes('málaga') || city.includes('malaga')) {
      return {
        description: "Málaga offers students an authentic Southern Spanish experience in Andalusia's vibrant coastal capital, where Mediterranean culture meets rich Moorish heritage and modern innovation. Students explore the magnificent Alcazaba fortress and Roman theatre while discovering the birthplace of Pablo Picasso and the city's profound influence on Spanish art and culture. The Costa del Sol provides insights into Spain's tourism industry and sustainable coastal development, while the historic city center showcases traditional Andalusian architecture and the famous Semana Santa celebrations. Students experience authentic Spanish lifestyle through visits to local markets, traditional tapas culture, and flamenco performances, while learning about Spain's diverse regional identities and the importance of Andalusia in Spanish history and culture.",
        images: [
          { src: malaga1, alt: "Málaga's historic Alcazaba fortress and Mediterranean coast" },
          { src: malaga2, alt: "Traditional Andalusian architecture and culture" },
          { src: malaga3, alt: "Vibrant local markets and authentic Spanish lifestyle" },
          { src: malaga4, alt: "Modern Málaga and Costa del Sol development" }
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
    } else if (city.includes('alicante')) {
      return {
        description: "Alicante offers students an immersive experience in Spain's Mediterranean jewel, where ancient history meets modern coastal development and European tourism excellence. Students explore the impressive Santa Bárbara Castle and discover the city's strategic importance in Mediterranean trade throughout history. The beautiful Costa Blanca beaches provide insights into sustainable tourism development and Spain's leadership in the European travel industry. Students experience authentic Valencian culture through traditional festivals, local gastronomy, and the famous Explanada de España, while learning about Spain's regional diversity and the importance of the Mediterranean economy in modern Europe.",
        images: [
          { src: alicante1, alt: "Alicante's stunning Santa Bárbara Castle and coastline" },
          { src: alicante2, alt: "Traditional Mediterranean architecture and culture" },
          { src: alicante3, alt: "Beautiful Costa Blanca beaches and tourism" },
          { src: alicante4, alt: "Modern Alicante and Explanada de España" }
        ]
      };
    }
    
    return {
      description: "This destination offers students an excellent opportunity for educational and cultural growth through immersive experiences and professional development in a unique European setting.",
      images: [
        { src: madrid1, alt: "Educational travel destination" }
      ]
    };
  };

  const highlights = getDestinationHighlights(quote.destination);

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-break {
            page-break-before: always;
          }
          
          h1, h2, h3 {
            page-break-after: avoid;
          }
          
          .avoid-break {
            page-break-inside: avoid;
          }
        }
      `}</style>
      
      {/* Print Button */}
      <div className="no-print fixed top-4 right-4 z-10">
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🖨️ Print Quote
        </button>
      </div>
      
      {/* Quote Content */}
      <div className="max-w-4xl mx-auto p-8">
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
          <p className="text-xs text-slate-500">Quote #{quote.quoteNumber}</p>
        </div>

        {/* Trip Details */}
        <div className="avoid-break mb-8">
          <div className="bg-slate-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Trip Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-700">Destination:</span>
                <div className="text-slate-600">{quote.destination}</div>
              </div>
              <div>
                <span className="font-medium text-slate-700">Duration:</span>
                <div className="text-slate-600">{quote.duration}</div>
              </div>
              <div>
                <span className="font-medium text-slate-700">Students:</span>
                <div className="text-slate-600">{quote.numberOfStudents}</div>
              </div>
              <div>
                <span className="font-medium text-slate-700">Teachers:</span>
                <div className="text-slate-600">{quote.numberOfTeachers}</div>
              </div>
              <div>
                <span className="font-medium text-slate-700">Dates:</span>
                <div className="text-slate-600 text-xs">
                  {new Date(quote.startDate).toLocaleDateString()} - {new Date(quote.endDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="font-medium text-slate-700">Trip Type:</span>
                <div className="text-slate-600">{quote.tripType}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Destination Highlights */}
        <div className="avoid-break mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b-2 border-yellow-400 pb-2">
            Why {quote.destination} for Educational Travel?
          </h2>
          
          <div className="mb-6">
            <img 
              src={getDestinationImage(quote.destination)} 
              alt={quote.destination}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-slate-700 leading-relaxed">
              {highlights.description}
            </p>
          </div>
        </div>

        {/* Investment Summary */}
        <div className="print-break">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 border-b-2 border-yellow-400 pb-2">
            Investment Summary
          </h2>
          
          <div className="bg-slate-50 p-6 rounded-lg">
            <div className="space-y-4">
              {/* Students breakdown */}
              <div className="avoid-break">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-700">
                    Students ({quote.numberOfStudents} × €{costBreakdown.student.totalPerStudent} per student)
                  </span>
                  <span className="text-slate-900 font-bold">
                    {formatCurrency(costBreakdown.student.totalForAllStudents)}
                  </span>
                </div>
                
                {/* Detailed student cost breakdown */}
                <div className="ml-4 text-sm text-slate-600 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span>Accommodation ({parseDuration(quote.duration || "7")} days)</span>
                    <span>{formatCurrency(costBreakdown.student.accommodation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meals</span>
                    <span>{formatCurrency(costBreakdown.student.meals)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local Transport</span>
                    <span>{formatCurrency(costBreakdown.student.transportCard)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Airport Transfers</span>
                    <span>{formatCurrency(costBreakdown.student.airportTransfer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coordination Services</span>
                    <span>{formatCurrency(costBreakdown.student.coordinationFee)}</span>
                  </div>
                </div>
              </div>

              {/* Teachers breakdown */}
              {quote.numberOfTeachers > 0 && (
                <div className="avoid-break">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-700">
                      Teachers ({quote.numberOfTeachers} × €{costBreakdown.teacher.totalPerTeacher} per teacher)
                    </span>
                    <span className="text-slate-900 font-bold">
                      {formatCurrency(costBreakdown.teacher.totalForAllTeachers)}
                    </span>
                  </div>
                  
                  {/* Detailed teacher cost breakdown */}
                  <div className="ml-4 text-sm text-slate-600 space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span>Accommodation ({parseDuration(quote.duration || "7")} days)</span>
                      <span>{formatCurrency(costBreakdown.teacher.accommodation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meals</span>
                      <span>{formatCurrency(costBreakdown.teacher.meals)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Local Transport</span>
                      <span>{formatCurrency(costBreakdown.teacher.transportCard)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Airport Transfers</span>
                      <span>{formatCurrency(costBreakdown.teacher.airportTransfer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coordination Services</span>
                      <span>{formatCurrency(costBreakdown.teacher.coordinationFee)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Services */}
              {adhocServices.length > 0 && (
                <div className="avoid-break">
                  <div className="text-sm font-medium text-slate-700 mb-2">Additional Services:</div>
                  {adhocServices.map((service, index) => (
                    <div key={index} className="flex justify-between items-center ml-4 py-1">
                      <span className="text-slate-600">{service.name}</span>
                      <span className="text-slate-700 font-medium">
                        {formatCurrency(service.pricePerPerson * (service.studentCount + service.teacherCount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="border-t border-slate-300 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-900">Total Investment</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(costBreakdown.total)}
                  </span>
                </div>
                
                {/* Quote details for reference */}
                <div className="mt-4 text-sm text-slate-500 space-y-1">
                  {quote.fiscalName && <div>Client: {quote.fiscalName}</div>}
                  {quote.email && <div>Email: {quote.email}</div>}
                  {quote.city && quote.country && <div>Location: {quote.city}, {quote.country}</div>}
                  {quote.tripType && <div>Trip Type: {quote.tripType}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <div className="border-t border-slate-200 pt-4">
            <p className="font-medium">My Abroad Ally</p>
            <p>Educational Travel Specialists</p>
            <p>Contact us for more information about this educational travel opportunity</p>
          </div>
        </div>
      </div>
    </div>
  );
}