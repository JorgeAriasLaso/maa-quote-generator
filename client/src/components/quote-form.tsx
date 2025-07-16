import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuoteSchema, type InsertQuote, type Client } from "@shared/schema";
import { calculateQuoteCost, formatCurrency, type AdhocService } from "@shared/costing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wand2, Calculator, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface QuoteFormProps {
  onSubmit: (data: InsertQuote) => void;
  isLoading: boolean;
  onCostBreakdownChange?: (costBreakdown: any) => void;
  currentQuote?: any;
  selectedClient?: Client | null;
}

// AdhocServicesSection component
interface AdhocServicesSectionProps {
  form: any;
  numberOfStudents: number;
  numberOfTeachers: number;
}

function AdhocServicesSection({ form, numberOfStudents, numberOfTeachers }: AdhocServicesSectionProps) {
  const [services, setServices] = useState<AdhocService[]>([]);

  // Parse existing adhoc services from form
  useEffect(() => {
    const adhocServicesValue = form.getValues("adhocServices");
    if (adhocServicesValue) {
      try {
        const parsed = JSON.parse(adhocServicesValue);
        setServices(parsed);
      } catch (e) {
        setServices([]);
      }
    }
  }, [form]);

  // Update form when services change
  useEffect(() => {
    form.setValue("adhocServices", JSON.stringify(services));
  }, [services, form]);

  const addService = () => {
    setServices([...services, { name: "", pricePerPerson: 0 }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof AdhocService, value: string | number) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const totalParticipants = numberOfStudents + numberOfTeachers;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">
        Additional Services
      </h3>

      <div className="space-y-4">
        {services.map((service, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Service Description
                </label>
                <Input
                  placeholder="e.g., Travel Insurance, Tour Guide"
                  value={service.name}
                  onChange={(e) => updateService(index, "name", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Price per Person (€)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={service.pricePerPerson || ""}
                  onChange={(e) => updateService(index, "pricePerPerson", parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Total: <span className="font-medium">
                    {formatCurrency(service.pricePerPerson * totalParticipants)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeService(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addService}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>

        {services.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-slate-700">
              Total Additional Services: 
              <span className="ml-2 text-primary font-bold">
                {formatCurrency(services.reduce((total, service) => 
                  total + (service.pricePerPerson * totalParticipants), 0))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function QuoteForm({ onSubmit, isLoading, onCostBreakdownChange, currentQuote, selectedClient }: QuoteFormProps) {
  const [selectedDestination, setSelectedDestination] = useState("");
  const [customDestination, setCustomDestination] = useState("");
  const [schoolComboboxOpen, setSchoolComboboxOpen] = useState(false);
  const [currentSelectedClient, setCurrentSelectedClient] = useState<Client | null>(selectedClient || null);

  // Fetch clients for autocomplete
  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

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

  const form = useForm<InsertQuote>({
    resolver: zodResolver(insertQuoteSchema),
    defaultValues: {
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
      pricePerStudent: "",
      pricePerTeacher: "",
      adhocServices: "[]",
      // Set all pricing fields to empty strings to avoid "010" issue
      studentAccommodationPerDay: "",
      teacherAccommodationPerDay: "",
      breakfastPerDay: "",
      lunchPerDay: "",
      dinnerPerDay: "",
      transportCardTotal: "",
      studentCoordinationFeeTotal: "",
      teacherCoordinationFeeTotal: "",
      airportTransferPerPerson: "",
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
    },
  });

  const handleDestinationChange = (value: string) => {
    setSelectedDestination(value);
    if (value === "Other") {
      form.setValue("destination", customDestination);
    } else {
      form.setValue("destination", value);
      setCustomDestination("");
    }
  };

  const handleCustomDestinationChange = (value: string) => {
    setCustomDestination(value);
    if (selectedDestination === "Other") {
      form.setValue("destination", value);
    }
  };

  const handleClientSelect = (client: Client) => {
    setCurrentSelectedClient(client);
    form.setValue("fiscalName", client.fiscalName);
    form.setValue("taxId", client.taxId || "");
    form.setValue("email", client.email || "");
    form.setValue("country", client.country);
    form.setValue("city", client.city);
    form.setValue("postcode", client.postcode || "");
    form.setValue("address", client.address || "");
    setSchoolComboboxOpen(false);
  };

  // Effect to populate form when client is selected from clients page
  useEffect(() => {
    if (selectedClient && !currentSelectedClient) {
      setCurrentSelectedClient(selectedClient);
      form.setValue("fiscalName", selectedClient.fiscalName);
      form.setValue("taxId", selectedClient.taxId || "");
      form.setValue("email", selectedClient.email || "");
      form.setValue("country", selectedClient.country);
      form.setValue("city", selectedClient.city);
      form.setValue("postcode", selectedClient.postcode || "");
      form.setValue("address", selectedClient.address || "");
    }
  }, [selectedClient, currentSelectedClient, form]);

  // Effect to populate form when editing an existing quote
  useEffect(() => {
    if (currentQuote) {
      // Use form.reset to properly update all fields and trigger re-renders
      const formData = {
        // Basic quote information
        destination: currentQuote.destination || "",
        tripType: currentQuote.tripType || "",
        startDate: currentQuote.startDate || "",
        endDate: currentQuote.endDate || "",
        duration: currentQuote.duration || "",
        numberOfStudents: currentQuote.numberOfStudents || 0,
        numberOfTeachers: currentQuote.numberOfTeachers || 0,
        
        // School/Client information
        fiscalName: currentQuote.fiscalName || "",
        taxId: currentQuote.taxId || "",
        email: currentQuote.email || "",
        country: currentQuote.country || "",
        city: currentQuote.city || "",
        postcode: currentQuote.postcode || "",
        address: currentQuote.address || "",
        
        // Pricing fields
        pricePerStudent: currentQuote.pricePerStudent?.toString() || "",
        pricePerTeacher: currentQuote.pricePerTeacher?.toString() || "",
        adhocServices: currentQuote.adhocServices || "[]",
        
        // Service pricing fields - ensure these are strings
        studentAccommodationPerDay: currentQuote.studentAccommodationPerDay ? currentQuote.studentAccommodationPerDay.toString() : "",
        teacherAccommodationPerDay: currentQuote.teacherAccommodationPerDay ? currentQuote.teacherAccommodationPerDay.toString() : "",
        breakfastPerDay: currentQuote.breakfastPerDay ? currentQuote.breakfastPerDay.toString() : "",
        lunchPerDay: currentQuote.lunchPerDay ? currentQuote.lunchPerDay.toString() : "",
        dinnerPerDay: currentQuote.dinnerPerDay ? currentQuote.dinnerPerDay.toString() : "",
        transportCardTotal: currentQuote.transportCardTotal ? currentQuote.transportCardTotal.toString() : "",
        studentCoordinationFeeTotal: currentQuote.studentCoordinationFeeTotal ? currentQuote.studentCoordinationFeeTotal.toString() : "",
        teacherCoordinationFeeTotal: currentQuote.teacherCoordinationFeeTotal ? currentQuote.teacherCoordinationFeeTotal.toString() : "",
        airportTransferPerPerson: currentQuote.airportTransferPerPerson ? currentQuote.airportTransferPerPerson.toString() : "",
        
        // Service inclusion checkboxes
        travelInsurance: currentQuote.travelInsurance || false,
        airportTransfers: currentQuote.airportTransfers || false,
        localTransport: currentQuote.localTransport || false,
        tourGuide: currentQuote.tourGuide || false,
        
        // Internal cost fields
        costStudentAccommodationPerDay: currentQuote.costStudentAccommodationPerDay ? currentQuote.costStudentAccommodationPerDay.toString() : "",
        costTeacherAccommodationPerDay: currentQuote.costTeacherAccommodationPerDay ? currentQuote.costTeacherAccommodationPerDay.toString() : "",
        costBreakfastPerDay: currentQuote.costBreakfastPerDay ? currentQuote.costBreakfastPerDay.toString() : "",
        costLunchPerDay: currentQuote.costLunchPerDay ? currentQuote.costLunchPerDay.toString() : "",
        costDinnerPerDay: currentQuote.costDinnerPerDay ? currentQuote.costDinnerPerDay.toString() : "",
        costLocalTransportationCard: currentQuote.costLocalTransportationCard ? currentQuote.costLocalTransportationCard.toString() : "",
        costStudentCoordination: currentQuote.costStudentCoordination ? currentQuote.costStudentCoordination.toString() : "",
        costTeacherCoordination: currentQuote.costTeacherCoordination ? currentQuote.costTeacherCoordination.toString() : "",
        costLocalCoordinator: currentQuote.costLocalCoordinator ? currentQuote.costLocalCoordinator.toString() : "",
        costAirportTransfer: currentQuote.costAirportTransfer ? currentQuote.costAirportTransfer.toString() : "",
      };
      
      form.reset(formData);
      
      // Handle destination selection
      if (currentQuote.destination) {
        const isKnownDestination = Object.values(destinationsByCountry).flat().includes(currentQuote.destination);
        if (isKnownDestination) {
          setSelectedDestination(currentQuote.destination);
        } else {
          setSelectedDestination("Other");
          setCustomDestination(currentQuote.destination);
        }
      }
    }
  }, [currentQuote, form, destinationsByCountry]);

  // Watch form values for automatic duration and pricing calculation
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const destination = form.watch("destination");
  const duration = form.watch("duration");
  const numberOfStudents = form.watch("numberOfStudents");
  const numberOfTeachers = form.watch("numberOfTeachers");
  const studentAccommodationPerDay = form.watch("studentAccommodationPerDay");
  const teacherAccommodationPerDay = form.watch("teacherAccommodationPerDay");
  const breakfastPerDay = form.watch("breakfastPerDay");
  const lunchPerDay = form.watch("lunchPerDay");
  const dinnerPerDay = form.watch("dinnerPerDay");
  const transportCardTotal = form.watch("transportCardTotal");
  const studentCoordinationFeeTotal = form.watch("studentCoordinationFeeTotal");
  const teacherCoordinationFeeTotal = form.watch("teacherCoordinationFeeTotal");
  const airportTransferPerPerson = form.watch("airportTransferPerPerson");
  const travelInsurance = form.watch("travelInsurance");
  const airportTransfers = form.watch("airportTransfers");
  const localTransport = form.watch("localTransport");
  const tourGuide = form.watch("tourGuide");



  // Calculate duration when start and end dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Number of full days between dates
      
      if (daysDiff > 0) {
        const newDuration = daysDiff === 1 ? "1 day" : `${daysDiff} days`;
        form.setValue("duration", newDuration, { shouldValidate: false });
      } else if (daysDiff <= 0) {
        form.setValue("duration", "", { shouldValidate: false });
      }
    } else {
      form.setValue("duration", "", { shouldValidate: false });
    }
  }, [startDate, endDate, form]);

  // Get internal cost fields for profitability calculation
  const costStudentAccommodationPerDay = form.watch("costStudentAccommodationPerDay");
  const costTeacherAccommodationPerDay = form.watch("costTeacherAccommodationPerDay");
  const costBreakfastPerDay = form.watch("costBreakfastPerDay");
  const costLunchPerDay = form.watch("costLunchPerDay");
  const costDinnerPerDay = form.watch("costDinnerPerDay");
  const costLocalTransportationCard = form.watch("costLocalTransportationCard");
  const costStudentCoordination = form.watch("costStudentCoordination");
  const costTeacherCoordination = form.watch("costTeacherCoordination");
  const costLocalCoordinator = form.watch("costLocalCoordinator");

  // Calculate pricing when relevant values change
  const costBreakdown = destination && duration && numberOfStudents >= 0 && numberOfTeachers >= 0 ? 
    calculateQuoteCost(
      destination,
      duration,
      numberOfStudents,
      numberOfTeachers,
      [], // Empty array for adhocServices in the form calculation
      {
        studentAccommodationPerDay: studentAccommodationPerDay ? parseFloat(studentAccommodationPerDay) : undefined,
        teacherAccommodationPerDay: teacherAccommodationPerDay ? parseFloat(teacherAccommodationPerDay) : undefined,
        breakfastPerDay: breakfastPerDay ? parseFloat(breakfastPerDay) : undefined,
        lunchPerDay: lunchPerDay ? parseFloat(lunchPerDay) : undefined,
        dinnerPerDay: dinnerPerDay ? parseFloat(dinnerPerDay) : undefined,
        transportCardTotal: transportCardTotal ? parseFloat(transportCardTotal) : undefined,
        studentCoordinationFeeTotal: studentCoordinationFeeTotal ? parseFloat(studentCoordinationFeeTotal) : undefined,
        teacherCoordinationFeeTotal: teacherCoordinationFeeTotal ? parseFloat(teacherCoordinationFeeTotal) : undefined,
        airportTransferPerPerson: airportTransferPerPerson ? parseFloat(airportTransferPerPerson) : undefined,
      },
      {
        costStudentAccommodationPerDay: costStudentAccommodationPerDay ? parseFloat(costStudentAccommodationPerDay) : undefined,
        costTeacherAccommodationPerDay: costTeacherAccommodationPerDay ? parseFloat(costTeacherAccommodationPerDay) : undefined,
        costBreakfastPerDay: costBreakfastPerDay ? parseFloat(costBreakfastPerDay) : undefined,
        costLunchPerDay: costLunchPerDay ? parseFloat(costLunchPerDay) : undefined,
        costDinnerPerDay: costDinnerPerDay ? parseFloat(costDinnerPerDay) : undefined,
        costLocalTransportationCard: costLocalTransportationCard ? parseFloat(costLocalTransportationCard) : undefined,
        costStudentCoordination: costStudentCoordination ? parseFloat(costStudentCoordination) : undefined,
        costTeacherCoordination: costTeacherCoordination ? parseFloat(costTeacherCoordination) : undefined,
        costLocalCoordinator: costLocalCoordinator ? parseFloat(costLocalCoordinator) : undefined,
      }
    ) : null;

  // Pass cost breakdown to parent component for live preview
  useEffect(() => {
    if (onCostBreakdownChange) {
      onCostBreakdownChange(costBreakdown);
    }
  }, [costBreakdown, onCostBreakdownChange]);

  // Update pricing fields when calculation changes
  useEffect(() => {
    if (costBreakdown) {
      form.setValue("pricePerStudent", costBreakdown.pricePerStudent.toString(), { shouldValidate: false });
      form.setValue("pricePerTeacher", costBreakdown.pricePerTeacher.toString(), { shouldValidate: false });
    }
  }, [costBreakdown, form]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Create Educational Travel Quote</h2>
        <p className="text-slate-600">Fill in the details to generate a professional travel quote for schools</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* School Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">School Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fiscalName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>School Name</FormLabel>
                    <Popover open={schoolComboboxOpen} onOpenChange={setSchoolComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? field.value
                              : "Select school or type to search..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command
                          filter={(value, search) => {
                            // Case-insensitive search
                            const normalizedSearch = search.toLowerCase();
                            const normalizedValue = value.toLowerCase();
                            
                            // Search in fiscal name, city, and country
                            const client = clients?.find(c => c.fiscalName.toLowerCase() === normalizedValue);
                            if (client) {
                              return (
                                client.fiscalName.toLowerCase().includes(normalizedSearch) ||
                                client.city.toLowerCase().includes(normalizedSearch) ||
                                client.country.toLowerCase().includes(normalizedSearch) ||
                                client.email?.toLowerCase().includes(normalizedSearch) ||
                                client.taxId?.toLowerCase().includes(normalizedSearch)
                              ) ? 1 : 0;
                            }
                            
                            return normalizedValue.includes(normalizedSearch) ? 1 : 0;
                          }}
                        >
                          <CommandInput 
                            placeholder="Search schools..." 
                            onValueChange={(value) => {
                              if (value && !clients?.find(c => c.fiscalName.toLowerCase() === value.toLowerCase())) {
                                form.setValue("fiscalName", value);
                              }
                            }}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <div className="p-2 text-sm text-slate-600">
                                No schools found. You can still type a custom school name.
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {clients?.map((client) => (
                                <CommandItem
                                  key={client.id}
                                  value={client.fiscalName.toLowerCase()}
                                  onSelect={() => handleClientSelect(client)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      currentSelectedClient?.id === client.id ? "opacity-100" : "opacity-0"
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@school.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter postcode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter full address" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tax ID (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Basic Trip Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">Trip Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <Select onValueChange={handleDestinationChange} value={selectedDestination}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(destinationsByCountry).map(([country, cities]) => (
                            <div key={country}>
                              <div className="px-2 py-1.5 text-sm font-semibold text-slate-600 bg-slate-50">
                                {country}
                              </div>
                              {cities.map((city) => (
                                <SelectItem key={`${city}, ${country}`} value={`${city}, ${country}`} className="pl-6">
                                  {city}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                          <div className="border-t border-slate-200 mt-1 pt-1">
                            <SelectItem value="Other" className="font-medium">
                              Other
                            </SelectItem>
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tripType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Work Experience Mobility">Work Experience Mobility</SelectItem>
                          <SelectItem value="Job Shadowing">Job Shadowing</SelectItem>
                          <SelectItem value="School Exchange">School Exchange</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {selectedDestination === "Other" && (
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Destination *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter city, country" 
                          value={customDestination}
                          onChange={(e) => {
                            handleCustomDestinationChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="7 days" 
                        {...field} 
                        readOnly 
                        className="bg-slate-50 text-slate-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numberOfStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Students</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="numberOfTeachers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accompanying Teachers</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>



          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">
              <Calculator className="inline h-5 w-5 mr-2" />
              Pricing & Cost Breakdown
            </h3>
            
            {costBreakdown ? (
              <Card className="bg-blue-50 p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-blue-800">Price per Student:</span>
                      <div className="text-2xl font-bold text-blue-900">{formatCurrency(costBreakdown.pricePerStudent)}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-800">Price per Teacher:</span>
                      <div className="text-2xl font-bold text-blue-900">{formatCurrency(costBreakdown.pricePerTeacher)}</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-blue-200 pt-4">
                    <h4 className="font-semibold text-blue-900 mb-3">Detailed Cost Breakdown:</h4>
                    <div className="space-y-3 text-sm">
                      
                      {/* Students breakdown */}
                      <div className="bg-blue-100/50 p-3 rounded">
                        <h5 className="font-medium text-blue-800 mb-2">Students ({numberOfStudents} × {costBreakdown.student.totalPerStudent}€):</h5>
                        <div className="space-y-1 text-xs">
                          {studentAccommodationPerDay && parseFloat(studentAccommodationPerDay) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-blue-600">• Accommodation:</span>
                              <span className="text-blue-900">{formatCurrency(costBreakdown.student.accommodation)}</span>
                            </div>
                          )}
                          {((breakfastPerDay && parseFloat(breakfastPerDay) > 0) || 
                            (lunchPerDay && parseFloat(lunchPerDay) > 0) || 
                            (dinnerPerDay && parseFloat(dinnerPerDay) > 0)) && (
                            <div className="flex justify-between">
                              <span className="text-blue-600">• Meals ({[
                                breakfastPerDay && parseFloat(breakfastPerDay) > 0 && "breakfast",
                                lunchPerDay && parseFloat(lunchPerDay) > 0 && "lunch", 
                                dinnerPerDay && parseFloat(dinnerPerDay) > 0 && "dinner"
                              ].filter(Boolean).join(", ")}):</span>
                              <span className="text-blue-900">{formatCurrency(costBreakdown.student.meals)}</span>
                            </div>
                          )}
                          {transportCardTotal && parseFloat(transportCardTotal) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-blue-600">• Local transportation card:</span>
                              <span className="text-blue-900">{formatCurrency(costBreakdown.student.transportCard)}</span>
                            </div>
                          )}
                          {studentCoordinationFeeTotal && parseFloat(studentCoordinationFeeTotal) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-blue-600">• Student coordination fee:</span>
                              <span className="text-blue-900">{formatCurrency(costBreakdown.student.coordinationFee)}</span>
                            </div>
                          )}
                          {airportTransferPerPerson && parseFloat(airportTransferPerPerson) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-blue-600">• Airport transfers:</span>
                              <span className="text-blue-900">{formatCurrency(costBreakdown.student.airportTransfer)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium pt-1 border-t border-blue-200">
                            <span className="text-blue-700">Students total:</span>
                            <span className="text-blue-900">{formatCurrency(costBreakdown.student.totalForAllStudents)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Teachers breakdown */}
                      <div className="bg-green-100/50 p-3 rounded">
                        <h5 className="font-medium text-green-800 mb-2">Teachers ({numberOfTeachers} × {costBreakdown.teacher.totalPerTeacher}€):</h5>
                        <div className="space-y-1 text-xs">
                          {teacherAccommodationPerDay && parseFloat(teacherAccommodationPerDay) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-green-600">• Accommodation:</span>
                              <span className="text-green-900">{formatCurrency(costBreakdown.teacher.accommodation)}</span>
                            </div>
                          )}
                          {((breakfastPerDay && parseFloat(breakfastPerDay) > 0) || 
                            (lunchPerDay && parseFloat(lunchPerDay) > 0) || 
                            (dinnerPerDay && parseFloat(dinnerPerDay) > 0)) && (
                            <div className="flex justify-between">
                              <span className="text-green-600">• Meals ({[
                                breakfastPerDay && parseFloat(breakfastPerDay) > 0 && "breakfast",
                                lunchPerDay && parseFloat(lunchPerDay) > 0 && "lunch", 
                                dinnerPerDay && parseFloat(dinnerPerDay) > 0 && "dinner"
                              ].filter(Boolean).join(", ")}):</span>
                              <span className="text-green-900">{formatCurrency(costBreakdown.teacher.meals)}</span>
                            </div>
                          )}
                          {transportCardTotal && parseFloat(transportCardTotal) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-green-600">• Local transportation card:</span>
                              <span className="text-green-900">{formatCurrency(costBreakdown.teacher.transportCard)}</span>
                            </div>
                          )}
                          {teacherCoordinationFeeTotal && parseFloat(teacherCoordinationFeeTotal) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-green-600">• Teacher coordination fee:</span>
                              <span className="text-green-900">{formatCurrency(costBreakdown.teacher.coordinationFee)}</span>
                            </div>
                          )}
                          {airportTransferPerPerson && parseFloat(airportTransferPerPerson) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-green-600">• Airport transfers:</span>
                              <span className="text-green-900">{formatCurrency(costBreakdown.teacher.airportTransfer)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium pt-1 border-t border-green-200">
                            <span className="text-green-700">Teachers total:</span>
                            <span className="text-green-900">{formatCurrency(costBreakdown.teacher.totalForAllTeachers)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional services */}
                      {costBreakdown.additionalServices.total > 0 && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Additional services:</span>
                          <span className="font-medium text-blue-900">{formatCurrency(costBreakdown.additionalServices.total)}</span>
                        </div>
                      )}
                      
                      {/* Group discount */}
                      {costBreakdown.groupDiscount && (
                        <div className="flex justify-between text-green-700">
                          <span>Group discount ({costBreakdown.groupDiscount.percentage}%):</span>
                          <span className="font-medium">-{formatCurrency(costBreakdown.groupDiscount.amount)}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-blue-200 pt-2 flex justify-between">
                        <span className="font-semibold text-blue-900">Total:</span>
                        <span className="text-xl font-bold text-blue-900">{formatCurrency(costBreakdown.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-50 p-6 text-center">
                <Calculator className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Complete the form above to see pricing calculation</p>
              </Card>
            )}
            
            {/* Hidden form fields for pricing data */}
            <div className="hidden">
              <FormField
                control={form.control}
                name="pricePerStudent"
                render={({ field }) => <Input {...field} />}
              />
              <FormField
                control={form.control}
                name="pricePerTeacher"
                render={({ field }) => <Input {...field} />}
              />
            </div>
          </div>

          {/* Custom Pricing Inputs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">
              <Calculator className="inline h-5 w-5 mr-2" />
              Custom Pricing (Optional)
            </h3>
            
            <Card className="bg-slate-50 p-4">
              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">
                  Select each service you want to include by checking the box, then enter your pricing. Only selected services will appear in the quote:
                </p>
                


                {/* Daily Rates */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3">Daily Rates (per person per day)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="studentAccommodationPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox 
                              id="include-student-accommodation"
                              checked={!!(studentAccommodationPerDay && studentAccommodationPerDay !== "")}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  form.setValue("studentAccommodationPerDay", "");
                                } else {
                                  form.setValue("studentAccommodationPerDay", "0");
                                }
                              }}
                            />
                            <FormLabel>Student Accommodation (€/day)</FormLabel>
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="teacherAccommodationPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox 
                              id="include-teacher-accommodation"
                              checked={!!(teacherAccommodationPerDay && teacherAccommodationPerDay !== "")}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  form.setValue("teacherAccommodationPerDay", "");
                                } else {
                                  form.setValue("teacherAccommodationPerDay", "0");
                                }
                              }}
                            />
                            <FormLabel>Teacher Accommodation (€/day)</FormLabel>
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="breakfastPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox 
                              id="include-breakfast"
                              checked={!!(breakfastPerDay && breakfastPerDay !== "")}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  form.setValue("breakfastPerDay", "");
                                } else {
                                  form.setValue("breakfastPerDay", "0");
                                }
                              }}
                            />
                            <FormLabel>Breakfast (€/day)</FormLabel>
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lunchPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox 
                              id="include-lunch"
                              checked={!!(lunchPerDay && lunchPerDay !== "")}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  form.setValue("lunchPerDay", "");
                                } else {
                                  form.setValue("lunchPerDay", "0");
                                }
                              }}
                            />
                            <FormLabel>Lunch (€/day)</FormLabel>
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dinnerPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox 
                              id="include-dinner"
                              checked={!!(dinnerPerDay && dinnerPerDay !== "")}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  form.setValue("dinnerPerDay", "");
                                } else {
                                  form.setValue("dinnerPerDay", "0");
                                }
                              }}
                            />
                            <FormLabel>Dinner (€/day)</FormLabel>
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Total Trip Amounts */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3">Total Trip Amounts (per person for entire trip)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="transportCardTotal"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox 
                              id="include-transport"
                              checked={!!(transportCardTotal && transportCardTotal !== "")}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  form.setValue("transportCardTotal", "");
                                } else {
                                  form.setValue("transportCardTotal", "0");
                                }
                              }}
                            />
                            <FormLabel>Local Transportation Card (€/trip)</FormLabel>
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="studentCoordinationFeeTotal"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox 
                              id="include-student-coord"
                              checked={!!(studentCoordinationFeeTotal && studentCoordinationFeeTotal !== "")}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  form.setValue("studentCoordinationFeeTotal", "");
                                } else {
                                  form.setValue("studentCoordinationFeeTotal", "0");
                                }
                              }}
                            />
                            <FormLabel>Student Coordination (€/trip)</FormLabel>
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="teacherCoordinationFeeTotal"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox 
                              id="include-teacher-coord"
                              checked={!!(teacherCoordinationFeeTotal && teacherCoordinationFeeTotal !== "")}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  form.setValue("teacherCoordinationFeeTotal", "");
                                } else {
                                  form.setValue("teacherCoordinationFeeTotal", "0");
                                }
                              }}
                            />
                            <FormLabel>Teacher Coordination (€/trip)</FormLabel>
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="airportTransferPerPerson"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox 
                              id="include-airport"
                              checked={!!(airportTransferPerPerson && airportTransferPerPerson !== "")}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  form.setValue("airportTransferPerPerson", "");
                                  form.setValue("airportTransfers", false);
                                } else {
                                  form.setValue("airportTransferPerPerson", "0");
                                  form.setValue("airportTransfers", true);
                                }
                              }}
                            />
                            <FormLabel>Airport Transfer (€/person)</FormLabel>
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Additional Services */}
          <AdhocServicesSection form={form} numberOfStudents={numberOfStudents} numberOfTeachers={numberOfTeachers} />

          {/* Internal Cost Analysis */}
          <Card className="p-6 bg-red-50 border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
              Internal Cost Analysis (For Profitability)
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Enter your actual costs to calculate trip profitability. This section is for internal use only.
            </p>
            
            <div className="space-y-6">
              {/* Accommodation Costs */}
              <div>
                <h4 className="font-medium text-red-700 mb-3">Accommodation Costs (per night)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="costStudentAccommodationPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student accommodation cost (€/night)</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="costTeacherAccommodationPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher accommodation cost (€/night)</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Meal Costs */}
              <div>
                <h4 className="font-medium text-red-700 mb-3">Meal Costs (per person per day)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="costBreakfastPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Breakfast cost (€/day)</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="costLunchPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lunch cost (€/day)</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="costDinnerPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dinner cost (€/day)</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Other Costs */}
              <div>
                <h4 className="font-medium text-red-700 mb-3">Other Costs</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="costLocalTransportationCard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local transportation cost (€/person)</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="costStudentCoordination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student coordination cost (€/student)</FormLabel>
                        <FormControl>
                          <Input placeholder="60.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="costTeacherCoordination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher coordination cost (€/teacher)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="costLocalCoordinator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local coordinator cost (€/trip)</FormLabel>
                        <FormControl>
                          <Input placeholder="150.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Airport Transfer Costs */}
                <div>
                  <h4 className="font-medium text-red-700 mb-3">Airport Transfer Costs</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="costAirportTransfer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Airport transfer cost (€/person)</FormLabel>
                          <FormControl>
                            <Input placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Generate Button */}
          <div className="pt-6 border-t border-slate-200">
            <Button 
              type="submit" 
              className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              disabled={isLoading}
            >
              <Wand2 className="mr-2 h-4 w-4" />
{isLoading ? (currentQuote ? "Updating..." : "Generating...") : (currentQuote ? "Update Quote Preview" : "Generate Quote Preview")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
