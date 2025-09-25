import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuoteSchema, type InsertQuote, type Client } from "@shared/schema";
import { calculateQuoteCost, formatCurrency, type AdhocService } from "@shared/costing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
        // Add backward compatibility for existing quotes
        const servicesWithCounts = parsed.map((service: any) => ({
          ...service,
          studentCount: service.studentCount !== undefined ? service.studentCount : numberOfStudents,
          teacherCount: service.teacherCount !== undefined ? service.teacherCount : numberOfTeachers,
        }));
        setServices(servicesWithCounts);
      } catch (e) {
        setServices([]);
      }
    }
  }, [form, numberOfStudents, numberOfTeachers]);

  // Update form when services change
  useEffect(() => {
    form.setValue("adhocServices", JSON.stringify(services));
  }, [services, form]);

  const addService = () => {
    setServices([...services, { name: "", pricePerPerson: 0, studentCount: numberOfStudents, teacherCount: numberOfTeachers }]);
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Students
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={service.studentCount || ""}
                  onChange={(e) => updateService(index, "studentCount", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Teachers
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={service.teacherCount || ""}
                  onChange={(e) => updateService(index, "teacherCount", parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Total: <span className="font-medium">
                    {formatCurrency(service.pricePerPerson * (service.studentCount + service.teacherCount))}
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
                  total + (service.pricePerPerson * (service.studentCount + service.teacherCount)), 0))}
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadError("");

    // Validate files
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setUploadError(`File ${file.name} is not an image.`);
        return;
      }
    }

    if (uploadedImages.length + files.length > 6) {
      setUploadError("Maximum 6 images allowed.");
      return;
    }

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadedImages(prev => [...prev, ...result.filePaths]);
      
      // Update form with uploaded image paths
      const allImages = [...uploadedImages, ...result.filePaths];
      form.setValue("customImages", JSON.stringify(allImages));
    } catch (error) {
      setUploadError("Failed to upload images. Please try again.");
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    form.setValue("customImages", JSON.stringify(newImages));
  };

  // Fetch clients for autocomplete
  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const destinationsByCountry = {
    "Czech Republic": ["Prague"],
    "Denmark": ["Copenhagen"],
    "France": ["Lyon", "Paris"],
    "Hungary": ["Budapest"],
    "Ireland": ["Dublin"],
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
      language: "English",
      // Set all pricing fields to empty strings to avoid "010" issue
      studentAccommodationPerDay: "",
      teacherAccommodationPerDay: "",
      accommodationName: "",
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
      customTitle: "",
      customContent: "",
      customImages: "",
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
        
        // Service pricing fields - handle all string values properly
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
        
        // Service inclusion checkboxes
        travelInsurance: currentQuote.travelInsurance || false,
        airportTransfers: currentQuote.airportTransfers || false,
        localTransport: currentQuote.localTransport || false,
        tourGuide: currentQuote.tourGuide || false,
        
        // Internal cost fields
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
  const tripType = form.watch("tripType");
  const duration = form.watch("duration");
  const showCoreFields = tripType !== "Additional Services";
  const numberOfStudents = form.watch("numberOfStudents");
  const numberOfTeachers = form.watch("numberOfTeachers");
  // Watch values for pricing calculations
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
      },
      tripType
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
        <form onSubmit={form.handleSubmit((data) => {
          const submitData = {
            ...data,
            clientId: currentSelectedClient?.id || selectedClient?.id || null,
          };
          onSubmit(submitData);
        })} encType="multipart/form-data" className="space-y-6">
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
                <>
                  {showCoreFields && (
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
                  )}
                  
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
                            <SelectItem value="Additional Services">Additional Services</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
                
                {tripType === "Other" && (
                  <FormField
                    control={form.control}
                    name="customTripType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Trip Type *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Please specify the trip type"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {tripType === "Additional Services" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                    <h4 className="text-sm font-medium text-slate-700">Custom Quote Configuration</h4>
                    
                    <FormField
                      control={form.control}
                      name="customTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Title *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter a custom title for this quote"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Content *</FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Enter detailed description for this service..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <FormLabel>Upload Images</FormLabel>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                        <input
                          type="file"
                          id="images"
                          name="images"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="images"
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <div className="text-slate-600 text-center">
                            <p className="text-lg font-medium">Upload image(s)</p>
                            <p className="text-sm text-slate-500 mt-1">
                              JPG, PNG up to 5MB each (max 6 images)
                            </p>
                          </div>
                        </label>
                        
                        {/* Image previews */}
                        {uploadedImages.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">
                              Uploaded Images ({uploadedImages.length}/6):
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {uploadedImages.map((image, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={image}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-20 object-cover rounded border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {uploadError && (
                        <p className="text-red-600 text-sm">{uploadError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {showCoreFields && selectedDestination === "Other" && (
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
          {showCoreFields && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">
                <Calculator className="inline h-5 w-5 mr-2" />
                Custom Pricing (Optional)
              </h3>
            
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-6">
              <p className="text-sm text-slate-700">
                <span className="font-medium">Pricing Layout:</span> Each item has two fields side by side:
                <span className="ml-2 inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Customer Price</span>
                <span className="ml-1 inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Internal Cost</span>
              </p>
            </div>
            
            {/* 1. Student Accommodation Cluster */}
            <div className="space-y-4 border border-blue-200 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <span className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                Student Accommodation
              </h4>
              
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="studentAccommodationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accommodation Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Youth Hostel Barcelona" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Daily Rate (€/day)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="studentAccommodationPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Price 0.00" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="costStudentAccommodationPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Cost 0.00" 
                                className="border-red-200 bg-red-50"
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
              </div>
            </div>

            {/* 2. Teacher Accommodation Cluster */}
            <div className="space-y-4 border border-green-200 bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <span className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                Teacher Accommodation
              </h4>
              
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="teacherAccommodationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accommodation Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Hotel Central" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Daily Rate (€/day)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="teacherAccommodationPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Price 0.00" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="costTeacherAccommodationPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Cost 0.00" 
                                className="border-red-200 bg-red-50"
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
              </div>
            </div>

            {/* 3. Meals Cluster - Hide for Additional Services */}
            {showCoreFields && (
            <div className="space-y-4 border border-orange-200 bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                <span className="bg-orange-100 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
                Meals
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Breakfast (€/day)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="breakfastPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Price 0.00" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="costBreakfastPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Cost 0.00" 
                                className="border-red-200 bg-red-50"
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Lunch (€/day)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="lunchPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Price 0.00" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="costLunchPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Cost 0.00" 
                                className="border-red-200 bg-red-50"
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Dinner (€/day)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="dinnerPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Price 0.00" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="costDinnerPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Cost 0.00" 
                                className="border-red-200 bg-red-50"
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
              </div>
            </div>
            )}

            {/* 4. Transportation & Transfers Cluster - Hide for Additional Services */}
            {showCoreFields && (
            <div className="space-y-4 border border-purple-200 bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                <span className="bg-purple-100 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">4</span>
                Transportation & Transfers
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Local Transportation Card (€ total)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="transportCardTotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Price 0.00" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="costLocalTransportationCard"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Cost 0.00" 
                                className="border-red-200 bg-red-50"
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Airport Transfer (€ per person)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="airportTransferPerPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Price 0.00" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="costAirportTransfer"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Cost 0.00" 
                                className="border-red-200 bg-red-50"
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
              </div>
            </div>
            )}

            {/* 5. Coordination Fees Cluster */}
            <div className="space-y-4 border border-indigo-200 bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
                <span className="bg-indigo-100 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">5</span>
                Coordination Fees
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Student Coordination Fee (€ total)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="studentCoordinationFeeTotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Price 0.00" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="costStudentCoordination"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Cost 60.00" 
                                className="border-red-200 bg-red-50"
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Teacher Coordination Fee (€ total)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="teacherCoordinationFeeTotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Price 0.00" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name="costTeacherCoordination"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Cost 0.00" 
                                className="border-red-200 bg-red-50"
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
              </div>
            </div>
            </div>
          )}

          {/* Additional Services */}
          <AdhocServicesSection form={form} numberOfStudents={numberOfStudents} numberOfTeachers={numberOfTeachers} />

          {/* Additional Internal Costs */}
          <Card className="p-6 bg-red-50 border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
              Additional Internal Costs
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Other costs not covered in the main pricing clusters above.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costLocalCoordinator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Coordinator Cost (€ total)</FormLabel>
                    <FormControl>
                      <Input placeholder="150.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Additional Comments */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2 mb-4">
              Additional Comments
            </h3>
            
            <FormField
              control={form.control}
              name="additionalComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <textarea 
                      className="w-full min-h-24 p-3 border border-slate-300 rounded-md resize-vertical"
                      placeholder="Add any special requirements, notes, or additional information about this trip..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Internal Notes - Only for your use */}
          <Card className="p-6 internal-analysis-only border-red-200 bg-red-50">
            <h3 className="text-lg font-medium text-red-900 border-b border-red-200 pb-2 mb-4 flex items-center">
              <span className="bg-red-100 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">⚠</span>
              Internal Notes (Private - Not shown to clients)
            </h3>
            
            <FormField
              control={form.control}
              name="internalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-red-700">Private Notes & Reminders</FormLabel>
                  <FormControl>
                    <textarea 
                      className="w-full min-h-32 p-3 border border-red-300 bg-white rounded-md resize-vertical"
                      placeholder="Add your private notes, reminders, contact details, special arrangements, profit targets, or any internal information that should NOT be shared with the client..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-red-600">
                    🔒 This information will never appear in client quotes or PDF exports
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
