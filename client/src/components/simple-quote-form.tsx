import { useState, useEffect } from "react";
import { type InsertQuote, type Quote, type Client } from "@shared/schema";
import { calculateQuoteCost, formatCurrency, type AdhocService } from "@shared/costing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wand2, Calculator, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface SimpleQuoteFormProps {
  onSubmit: (data: InsertQuote) => void;
  isLoading: boolean;
  onCostBreakdownChange?: (costBreakdown: any) => void;
  currentQuote?: Quote | null;
  selectedClient?: Client | null;
}

export function SimpleQuoteForm({ onSubmit, isLoading, onCostBreakdownChange, currentQuote, selectedClient }: SimpleQuoteFormProps) {
  // Form state - all controlled by useState instead of React Hook Form
  const [formData, setFormData] = useState<any>({
    destination: "",
    tripType: "",
    startDate: "",
    endDate: "",
    duration: "",
    numberOfStudents: 0,
    numberOfTeachers: 0,
    fiscalName: "",
    taxId: "",
    email: "",
    country: "",
    city: "",
    postcode: "",
    address: "",
    studentAccommodationPerDay: "",
    teacherAccommodationPerDay: "",
    studentAccommodationName: "",
    teacherAccommodationName: "",
    additionalComments: "",
    breakfastPerDay: "",
    lunchPerDay: "",
    dinnerPerDay: "",
    transportCardTotal: "",
    studentCoordinationFeeTotal: "",
    teacherCoordinationFeeTotal: "",
    airportTransferPerPerson: "",
    adhocServices: "[]",
    costStudentAccommodationPerDay: "",
    costTeacherAccommodationPerDay: "",
    costBreakfastPerDay: "",
    costLunchPerDay: "",
    costDinnerPerDay: "",
    costLocalTransportationCard: "",
    costStudentCoordination: "",
    costTeacherCoordination: "",
    costLocalCoordinator: "",
    costAirportTransfer: "",
  });

  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [customDestination, setCustomDestination] = useState<string>("");
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [isClientOpen, setIsClientOpen] = useState(false);
  const [clientQuery, setClientQuery] = useState("");
  const [selectedClientData, setSelectedClientData] = useState<Client | null>(null);
  const [adhocServices, setAdhocServices] = useState<AdhocService[]>([]);

  const destinationsByCountry = {
    "Czech Republic": ["Prague"],
    "Denmark": ["Copenhagen"],
    "France": ["Lyon", "Paris"],
    "Hungary": ["Budapest"],
    "Italy": ["Bari", "Catania"],
    "Poland": ["Kraków", "Poznań", "Warsaw"],
    "Portugal": ["Porto"],
    "Spain": ["Madrid", "Málaga", "Alicante", "Valladolid", "Gijón"],
    "United Kingdom": ["Bristol"]
  };

  // Fetch clients for autocomplete
  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Load currentQuote data when available
  useEffect(() => {
    if (currentQuote) {
      console.log("Loading current quote data:", currentQuote);
      setFormData({
        destination: currentQuote.destination || "",
        tripType: currentQuote.tripType || "",
        startDate: currentQuote.startDate || "",
        endDate: currentQuote.endDate || "",
        duration: currentQuote.duration || "",
        numberOfStudents: currentQuote.numberOfStudents || 0,
        numberOfTeachers: currentQuote.numberOfTeachers || 0,
        fiscalName: currentQuote.fiscalName || "",
        taxId: currentQuote.taxId || "",
        email: currentQuote.email || "",
        country: currentQuote.country || "",
        city: currentQuote.city || "",
        postcode: currentQuote.postcode || "",
        address: currentQuote.address || "",
        studentAccommodationPerDay: currentQuote.studentAccommodationPerDay || "",
        teacherAccommodationPerDay: currentQuote.teacherAccommodationPerDay || "",
        studentAccommodationName: currentQuote.studentAccommodationName || "",
        teacherAccommodationName: currentQuote.teacherAccommodationName || "",
        additionalComments: currentQuote.additionalComments || "",
        breakfastPerDay: currentQuote.breakfastPerDay || "",
        lunchPerDay: currentQuote.lunchPerDay || "",
        dinnerPerDay: currentQuote.dinnerPerDay || "",
        transportCardTotal: currentQuote.transportCardTotal || "",
        studentCoordinationFeeTotal: currentQuote.studentCoordinationFeeTotal || "",
        teacherCoordinationFeeTotal: currentQuote.teacherCoordinationFeeTotal || "",
        airportTransferPerPerson: currentQuote.airportTransferPerPerson || "",
        adhocServices: currentQuote.adhocServices || "[]",
        costStudentAccommodationPerDay: currentQuote.costStudentAccommodationPerDay || "",
        costTeacherAccommodationPerDay: currentQuote.costTeacherAccommodationPerDay || "",
        costBreakfastPerDay: currentQuote.costBreakfastPerDay || "",
        costLunchPerDay: currentQuote.costLunchPerDay || "",
        costDinnerPerDay: currentQuote.costDinnerPerDay || "",
        costLocalTransportationCard: currentQuote.costLocalTransportationCard || "",
        costStudentCoordination: currentQuote.costStudentCoordination || "",
        costTeacherCoordination: currentQuote.costTeacherCoordination || "",
        costLocalCoordinator: currentQuote.costLocalCoordinator || "",
        costAirportTransfer: currentQuote.costAirportTransfer || "",
      });

      // Handle destination
      if (currentQuote.destination) {
        const isKnownDestination = Object.values(destinationsByCountry).flat().includes(currentQuote.destination);
        if (isKnownDestination) {
          setSelectedDestination(currentQuote.destination);
          setCustomDestination("");
        } else {
          setSelectedDestination("Other");
          setCustomDestination(currentQuote.destination);
        }
      }

      // Handle adhoc services
      if (currentQuote.adhocServices) {
        try {
          const parsed = JSON.parse(currentQuote.adhocServices);
          setAdhocServices(parsed);
        } catch (e) {
          setAdhocServices([]);
        }
      }
    }
  }, [currentQuote]);

  // Load selectedClient data when available
  useEffect(() => {
    if (selectedClient) {
      setSelectedClientData(selectedClient);
      setFormData(prev => ({
        ...prev,
        fiscalName: selectedClient.fiscalName || "",
        taxId: selectedClient.taxId || "",
        email: selectedClient.email || "",
        country: selectedClient.country || "",
        city: selectedClient.city || "",
        postcode: selectedClient.postcode || "",
        address: selectedClient.address || "",
      }));
    }
  }, [selectedClient]);

  // Update form data
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate duration when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      updateFormData("duration", `${diffDays} days`);
    }
  }, [formData.startDate, formData.endDate]);

  // Calculate costs and trigger breakdown change
  useEffect(() => {
    try {
      const costBreakdown = calculateQuoteCost(
        formData.destination,
        formData.duration,
        formData.numberOfStudents,
        formData.numberOfTeachers,
        adhocServices,
        {
          studentAccommodationPerDay: parseFloat(formData.studentAccommodationPerDay || "0"),
          teacherAccommodationPerDay: parseFloat(formData.teacherAccommodationPerDay || "0"),
          breakfastPerDay: parseFloat(formData.breakfastPerDay || "0"),
          lunchPerDay: parseFloat(formData.lunchPerDay || "0"),
          dinnerPerDay: parseFloat(formData.dinnerPerDay || "0"),
          transportCardTotal: parseFloat(formData.transportCardTotal || "0"),
          studentCoordinationFeeTotal: parseFloat(formData.studentCoordinationFeeTotal || "0"),
          teacherCoordinationFeeTotal: parseFloat(formData.teacherCoordinationFeeTotal || "0"),
          airportTransferPerPerson: parseFloat(formData.airportTransferPerPerson || "0"),
        },
        {
          costStudentAccommodationPerDay: parseFloat(formData.costStudentAccommodationPerDay || "0"),
          costTeacherAccommodationPerDay: parseFloat(formData.costTeacherAccommodationPerDay || "0"),
          costBreakfastPerDay: parseFloat(formData.costBreakfastPerDay || "0"),
          costLunchPerDay: parseFloat(formData.costLunchPerDay || "0"),
          costDinnerPerDay: parseFloat(formData.costDinnerPerDay || "0"),
          costLocalTransportationCard: parseFloat(formData.costLocalTransportationCard || "0"),
          costStudentCoordination: parseFloat(formData.costStudentCoordination || "60"),
          costTeacherCoordination: parseFloat(formData.costTeacherCoordination || "0"),
          costLocalCoordinator: parseFloat(formData.costLocalCoordinator || "150"),
          costAirportTransfer: parseFloat(formData.costAirportTransfer || "0"),
        }
      );
      
      onCostBreakdownChange?.(costBreakdown);
    } catch (error) {
      console.error("Error calculating cost breakdown:", error);
    }
  }, [formData, adhocServices, onCostBreakdownChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalDestination = selectedDestination === "Other" ? customDestination : selectedDestination;
    
    const submitData: InsertQuote = {
      ...formData,
      destination: finalDestination,
      adhocServices: JSON.stringify(adhocServices),
      numberOfStudents: Number(formData.numberOfStudents),
      numberOfTeachers: Number(formData.numberOfTeachers),
    };
    
    onSubmit(submitData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Trip Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Destination */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Destination</label>
              <Popover open={isDestinationOpen} onOpenChange={setIsDestinationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isDestinationOpen}
                    className="w-full justify-between"
                  >
                    {selectedDestination === "Other" 
                      ? customDestination || "Select destination..."
                      : selectedDestination || "Select destination..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search destinations..." />
                    <CommandList>
                      <CommandEmpty>No destination found.</CommandEmpty>
                      {Object.entries(destinationsByCountry).map(([country, cities]) => (
                        <CommandGroup key={country} heading={country}>
                          {cities.map((city) => (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={() => {
                                setSelectedDestination(city);
                                updateFormData("destination", city);
                                setIsDestinationOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedDestination === city ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {city}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                      <CommandGroup>
                        <CommandItem
                          value="Other"
                          onSelect={() => {
                            setSelectedDestination("Other");
                            setIsDestinationOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedDestination === "Other" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Other (specify below)
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {selectedDestination === "Other" && (
                <Input
                  placeholder="Enter custom destination"
                  value={customDestination}
                  onChange={(e) => {
                    setCustomDestination(e.target.value);
                    updateFormData("destination", e.target.value);
                  }}
                />
              )}
            </div>

            {/* Trip Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Trip Type</label>
              <Select value={formData.tripType} onValueChange={(value) => updateFormData("tripType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trip type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Work Experience Mobility">Work Experience Mobility</SelectItem>
                  <SelectItem value="Job Shadowing">Job Shadowing</SelectItem>
                  <SelectItem value="School Exchange">School Exchange</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Start Date</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData("startDate", e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">End Date</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData("endDate", e.target.value)}
              />
            </div>

            {/* Number of Students */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Number of Students</label>
              <Input
                type="number"
                min="0"
                value={formData.numberOfStudents}
                onChange={(e) => updateFormData("numberOfStudents", parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Number of Teachers */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Number of Teachers</label>
              <Input
                type="number"
                min="0"
                value={formData.numberOfTeachers}
                onChange={(e) => updateFormData("numberOfTeachers", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </Card>

        {/* School Information */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">School Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">School Name</label>
              <Popover open={isClientOpen} onOpenChange={setIsClientOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isClientOpen}
                    className="w-full justify-between"
                  >
                    {selectedClientData ? selectedClientData.fiscalName : (formData.fiscalName || "Select or enter school name...")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search schools..." 
                      value={clientQuery}
                      onValueChange={setClientQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No school found.</CommandEmpty>
                      <CommandGroup>
                        {clients?.filter(client => 
                          client.fiscalName.toLowerCase().includes(clientQuery.toLowerCase())
                        ).map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.fiscalName}
                            onSelect={() => {
                              setSelectedClientData(client);
                              updateFormData("fiscalName", client.fiscalName);
                              updateFormData("taxId", client.taxId || "");
                              updateFormData("email", client.email || "");
                              updateFormData("country", client.country || "");
                              updateFormData("city", client.city || "");
                              updateFormData("postcode", client.postcode || "");
                              updateFormData("address", client.address || "");
                              setIsClientOpen(false);
                              setClientQuery("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClientData?.id === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <div className="font-medium">{client.fiscalName}</div>
                              <div className="text-sm text-slate-500">{client.city}, {client.country}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Manual input option */}
              <Input
                value={formData.fiscalName}
                onChange={(e) => {
                  updateFormData("fiscalName", e.target.value);
                  setSelectedClientData(null);
                }}
                placeholder="Or type school name manually"
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email (Optional)</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder="school@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Country</label>
              <Input
                value={formData.country}
                onChange={(e) => updateFormData("country", e.target.value)}
                placeholder="Country"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">City</label>
              <Input
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Postcode (Optional)</label>
              <Input
                value={formData.postcode}
                onChange={(e) => updateFormData("postcode", e.target.value)}
                placeholder="Postcode"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tax ID (Optional)</label>
              <Input
                value={formData.taxId}
                onChange={(e) => updateFormData("taxId", e.target.value)}
                placeholder="Tax ID"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Address (Optional)</label>
              <Textarea
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                placeholder="School address"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Pricing Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            <Calculator className="inline h-6 w-6 mr-2" />
            Custom Pricing (Optional)
          </h2>
          
          <div className="space-y-4">
            <h4 className="font-medium text-slate-700 mb-3">Accommodation Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Student Accommodation Name</label>
                <Input
                  value={formData.studentAccommodationName}
                  onChange={(e) => updateFormData("studentAccommodationName", e.target.value)}
                  placeholder="e.g., Youth Hostel Barcelona"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Teacher Accommodation Name</label>
                <Input
                  value={formData.teacherAccommodationName}
                  onChange={(e) => updateFormData("teacherAccommodationName", e.target.value)}
                  placeholder="e.g., Hotel Central"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Student Accommodation (€/day)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.studentAccommodationPerDay}
                onChange={(e) => updateFormData("studentAccommodationPerDay", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Teacher Accommodation (€/day)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.teacherAccommodationPerDay}
                onChange={(e) => updateFormData("teacherAccommodationPerDay", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Breakfast (€/day)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.breakfastPerDay}
                onChange={(e) => updateFormData("breakfastPerDay", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Lunch (€/day)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.lunchPerDay}
                onChange={(e) => updateFormData("lunchPerDay", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Dinner (€/day)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.dinnerPerDay}
                onChange={(e) => updateFormData("dinnerPerDay", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Local Transportation Card (€ total)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.transportCardTotal}
                onChange={(e) => updateFormData("transportCardTotal", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Student Coordination Fee (€ total)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.studentCoordinationFeeTotal}
                onChange={(e) => updateFormData("studentCoordinationFeeTotal", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Teacher Coordination Fee (€ total)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.teacherCoordinationFeeTotal}
                onChange={(e) => updateFormData("teacherCoordinationFeeTotal", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Airport Transfer (€ per person)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.airportTransferPerPerson}
                onChange={(e) => updateFormData("airportTransferPerPerson", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </Card>

        {/* Internal Cost Analysis */}
        <Card className="p-6 internal-analysis-only">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            <Calculator className="inline h-6 w-6 mr-2" />
            Internal Profitability Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Student Accommodation Cost (€/day)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costStudentAccommodationPerDay}
                onChange={(e) => updateFormData("costStudentAccommodationPerDay", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Teacher Accommodation Cost (€/day)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costTeacherAccommodationPerDay}
                onChange={(e) => updateFormData("costTeacherAccommodationPerDay", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Breakfast Cost (€/day)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costBreakfastPerDay}
                onChange={(e) => updateFormData("costBreakfastPerDay", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Lunch Cost (€/day)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costLunchPerDay}
                onChange={(e) => updateFormData("costLunchPerDay", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Dinner Cost (€/day)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costDinnerPerDay}
                onChange={(e) => updateFormData("costDinnerPerDay", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Local Transportation Cost (€ total)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costLocalTransportationCard}
                onChange={(e) => updateFormData("costLocalTransportationCard", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Student Coordination Cost (€ per student)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costStudentCoordination}
                onChange={(e) => updateFormData("costStudentCoordination", e.target.value)}
                placeholder="60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Teacher Coordination Cost (€ per teacher)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costTeacherCoordination}
                onChange={(e) => updateFormData("costTeacherCoordination", e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Local Coordinator Cost (€ total)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costLocalCoordinator}
                onChange={(e) => updateFormData("costLocalCoordinator", e.target.value)}
                placeholder="150"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Airport Transfer Cost (€ per person)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costAirportTransfer}
                onChange={(e) => updateFormData("costAirportTransfer", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </Card>

        {/* Additional Comments */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Additional Comments</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Additional Information (Optional)</label>
            <textarea
              className="w-full min-h-24 p-3 border border-slate-300 rounded-md resize-vertical"
              value={formData.additionalComments}
              onChange={(e) => updateFormData("additionalComments", e.target.value)}
              placeholder="Add any special requirements, notes, or additional information about this trip..."
            />
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            size="lg"
            className="px-8"
          >
            <Wand2 className="mr-2 h-5 w-5" />
            {currentQuote ? "Update Quote Preview" : "Generate Quote Preview"}
          </Button>
        </div>
      </form>
    </div>
  );
}