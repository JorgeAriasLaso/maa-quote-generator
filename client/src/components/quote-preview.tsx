import { type Quote } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, Printer } from "lucide-react";
import { CheckCircle, GraduationCap, Plane, Phone, Mail, Globe } from "lucide-react";
import logoPath from "@assets/Main Brand Logo_1752655471601.png";

interface QuotePreviewProps {
  quote: Quote | null;
}

export function QuotePreview({ quote }: QuotePreviewProps) {
  const calculateTotal = () => {
    if (!quote) return 0;
    
    const studentPrice = parseFloat(quote.pricePerStudent) * quote.numberOfStudents;
    let teacherPrice = 0;
    
    // Calculate teacher pricing based on discount
    if (quote.teacherDiscount === "50% Discount") {
      teacherPrice = parseFloat(quote.pricePerStudent) * quote.numberOfTeachers * 0.5;
    } else if (quote.teacherDiscount === "25% Discount") {
      teacherPrice = parseFloat(quote.pricePerStudent) * quote.numberOfTeachers * 0.75;
    } else if (quote.teacherDiscount === "No Discount") {
      teacherPrice = parseFloat(quote.pricePerStudent) * quote.numberOfTeachers;
    }
    // "Free (1:10 ratio)" = 0
    
    let additionalCosts = 0;
    const totalPeople = quote.numberOfStudents + quote.numberOfTeachers;
    
    if (quote.travelInsurance) additionalCosts += 15 * totalPeople;
    if (quote.airportTransfers) additionalCosts += 120;
    if (quote.localTransport) additionalCosts += 25 * totalPeople;
    if (quote.tourGuide) additionalCosts += 200 * parseInt(quote.duration.split(' ')[0] || '7');
    
    return studentPrice + teacherPrice + additionalCosts;
  };

  const getDestinationImage = (destination: string) => {
    const city = destination.toLowerCase();
    if (city.includes('prague')) {
      return "https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('madrid')) {
      return "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('barcelona')) {
      return "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('paris')) {
      return "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('london')) {
      return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('rome')) {
      return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('berlin')) {
      return "https://images.unsplash.com/photo-1587330979470-3bd2893099f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    } else if (city.includes('amsterdam')) {
      return "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    }
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
  };

  const getDestinationHighlights = (destination: string) => {
    const city = destination.toLowerCase();
    
    if (city.includes('madrid')) {
      return [
        {
          title: "Spain's Dynamic Capital",
          description: "Experience Madrid's vibrant business culture and modern European economy while exploring the heart of Spanish politics, finance, and innovation.",
          image: "https://images.unsplash.com/photo-1544980919-e17526d4ed0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "World-Class Art & Culture",
          description: "Visit the Prado Museum, Reina Sofia, and Thyssen-Bornemisza - three of the world's most important art museums, all within walking distance.",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Spanish Language Immersion",
          description: "Practice Spanish in its native environment while engaging with local professionals and experiencing authentic Spanish hospitality and culture.",
          image: "https://images.unsplash.com/photo-1543785734-4b6e564642f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Historic Royal Heritage",
          description: "Explore the Royal Palace, Plaza Mayor, and Retiro Park while learning about Spain's rich history and its role in global exploration and trade.",
          image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        }
      ];
    } else if (city.includes('prague')) {
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
    } else if (city.includes('barcelona')) {
      return [
        {
          title: "Architectural Wonderland",
          description: "Discover Gaudí's masterpieces including Sagrada Familia, Park Güell, and Casa Batlló while studying innovative architectural design and urban planning.",
          image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Mediterranean Business Hub",
          description: "Explore Barcelona's role as a major Mediterranean port and business center, with strong connections to Latin America and North Africa.",
          image: "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Catalan Culture & Innovation",
          description: "Experience the unique Catalan culture, language, and Barcelona's reputation as a smart city leader in technology and sustainability.",
          image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
        },
        {
          title: "Olympic Legacy & Sports",
          description: "Visit Olympic venues from 1992 and learn about Barcelona's transformation into a modern international city and sports destination.",
          image: "https://images.unsplash.com/photo-1544980919-e17526d4ed0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
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
    
    // Generic content for other destinations
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

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log("Export PDF functionality would be implemented here");
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
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
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
                className="bg-primary text-white hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Quote Document */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="max-w-2xl mx-auto bg-white">
            {/* Header */}
            <div className="text-center mb-12">
              <img 
                src={logoPath} 
                alt="My Abroad Ally" 
                className="h-20 w-20 object-contain mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Educational Travel Proposal</h1>
              <p className="text-lg text-slate-600 mb-4">by My Abroad Ally</p>
              <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
            </div>

            {/* Trip Title */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">{quote.tripType}</h2>
              <h3 className="text-xl text-primary font-medium mb-6">{quote.destination}</h3>
              
              {/* Main Image */}
              <div className="rounded-xl overflow-hidden shadow-lg mb-6">
                <img 
                  src={getDestinationImage(quote.destination)} 
                  alt={quote.destination} 
                  className="w-full h-64 object-cover"
                />
              </div>

              <Card className="bg-slate-50 p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Duration:</span>
                    <span className="text-slate-600 ml-2">{quote.duration}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Participants:</span>
                    <span className="text-slate-600 ml-2">{quote.numberOfStudents} Students + {quote.numberOfTeachers} Teachers</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Dates:</span>
                    <span className="text-slate-600 ml-2">
                      {new Date(quote.startDate).toLocaleDateString()} - {new Date(quote.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Quote #:</span>
                    <span className="text-slate-600 ml-2">{quote.quoteNumber}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Destination Highlights */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 border-b-2 border-primary pb-2">
                Why {quote.destination} for Educational Travel?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {highlights.map((highlight, index) => (
                  <div key={index} className="space-y-4">
                    <img 
                      src={highlight.image} 
                      alt={highlight.title} 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <h4 className="font-semibold text-slate-800">{highlight.title}</h4>
                    <p className="text-slate-600 text-sm">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="mb-12">
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
                    <span>Understanding of European history and political systems</span>
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
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">
                      {quote.numberOfStudents} Students @ €{quote.pricePerStudent} each
                    </span>
                    <span className="font-semibold text-slate-900">
                      €{(parseFloat(quote.pricePerStudent) * quote.numberOfStudents).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">
                      {quote.numberOfTeachers} Teachers ({quote.teacherDiscount})
                    </span>
                    <span className="font-semibold text-green-600">
                      €{quote.teacherDiscount === "Free (1:10 ratio)" ? "0" : 
                         quote.teacherDiscount === "50% Discount" ? 
                         (parseFloat(quote.pricePerStudent) * quote.numberOfTeachers * 0.5).toLocaleString() :
                         quote.teacherDiscount === "25% Discount" ? 
                         (parseFloat(quote.pricePerStudent) * quote.numberOfTeachers * 0.75).toLocaleString() :
                         (parseFloat(quote.pricePerStudent) * quote.numberOfTeachers).toLocaleString()
                      }
                    </span>
                  </div>
                  
                  {(quote.travelInsurance || quote.airportTransfers || quote.localTransport || quote.tourGuide) && (
                    <>
                      <div className="border-t border-slate-300 pt-2">
                        <h5 className="font-medium text-slate-700 mb-2">Additional Services:</h5>
                        {quote.travelInsurance && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Travel Insurance</span>
                            <span className="text-slate-700">
                              €{(15 * (quote.numberOfStudents + quote.numberOfTeachers)).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {quote.airportTransfers && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Airport Transfers</span>
                            <span className="text-slate-700">€120</span>
                          </div>
                        )}
                        {quote.localTransport && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Local Transport</span>
                            <span className="text-slate-700">
                              €{(25 * (quote.numberOfStudents + quote.numberOfTeachers)).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {quote.tourGuide && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Professional Tour Guide</span>
                            <span className="text-slate-700">
                              €{(200 * parseInt(quote.duration.split(' ')[0] || '7')).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  <div className="border-t border-slate-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-900">Total Investment</span>
                      <span className="text-2xl font-bold text-primary">€{calculateTotal().toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      All-inclusive package with accommodation, meals, activities, and support
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Next Steps */}
            <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 text-black text-center">
              <h3 className="text-lg font-semibold mb-4">Ready to Transform Your Students' Future?</h3>
              <p className="mb-6 text-gray-800">
                Contact My Abroad Ally to discuss this opportunity and customize the perfect educational experience for {quote.schoolName}.
              </p>
              
              <div className="space-y-2 text-sm font-medium">
                <p><Phone className="inline mr-2 h-4 w-4" />Contact us for personalized consultation</p>
                <p><Mail className="inline mr-2 h-4 w-4" />info@myabroadally.com</p>
                <p><Globe className="inline mr-2 h-4 w-4" />www.myabroadally.com</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
