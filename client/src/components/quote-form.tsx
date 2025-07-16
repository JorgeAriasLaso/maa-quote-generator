import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuoteSchema, type InsertQuote } from "@shared/schema";
import { calculateQuoteCost, formatCurrency } from "@shared/costing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Wand2, Calculator } from "lucide-react";
import { useState, useEffect } from "react";

interface QuoteFormProps {
  onSubmit: (data: InsertQuote) => void;
  isLoading: boolean;
}

export function QuoteForm({ onSubmit, isLoading }: QuoteFormProps) {
  const [selectedDestination, setSelectedDestination] = useState("");
  const [customDestination, setCustomDestination] = useState("");

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
      schoolName: "",
      contactPerson: "",
      schoolAddress: "",
      pricePerStudent: "850",
      pricePerTeacher: "0",
      travelInsurance: false,
      airportTransfers: false,
      localTransport: false,
      tourGuide: false,
      quoteNumber: "",
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

  // Watch form values for automatic duration and pricing calculation
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const destination = form.watch("destination");
  const duration = form.watch("duration");
  const numberOfStudents = form.watch("numberOfStudents");
  const numberOfTeachers = form.watch("numberOfTeachers");
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
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end days
      
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

  // Calculate pricing when relevant values change
  const costBreakdown = destination && duration && numberOfStudents >= 0 && numberOfTeachers >= 0 ? 
    calculateQuoteCost(
      destination,
      duration,
      numberOfStudents,
      numberOfTeachers,
      {
        travelInsurance: travelInsurance || false,
        airportTransfers: airportTransfers || false,
        localTransport: localTransport || false,
        tourGuide: tourGuide || false,
      }
    ) : null;

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

          {/* School Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">School Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Westminster High School" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Ms. Sarah Johnson" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="schoolAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Education Street, London, SW1A 1AA, United Kingdom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <h4 className="font-semibold text-blue-900 mb-3">Cost Breakdown:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Base cost ({numberOfStudents} students):</span>
                        <span className="font-medium text-blue-900">{formatCurrency(costBreakdown.baseStudentCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Teachers cost ({numberOfTeachers} teachers):</span>
                        <span className="font-medium text-blue-900">{formatCurrency(costBreakdown.teacherCost)}</span>
                      </div>
                      {costBreakdown.additionalServices.total > 0 && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Additional services:</span>
                          <span className="font-medium text-blue-900">{formatCurrency(costBreakdown.additionalServices.total)}</span>
                        </div>
                      )}
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

          {/* Additional Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">Additional Services</h3>
            
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="travelInsurance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Travel Insurance (€15 per person)</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="airportTransfers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Airport Transfers (€120 total)</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="localTransport"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Local Transport Pass (€25 per person)</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tourGuide"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Professional Tour Guide (€200 per day)</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-6 border-t border-slate-200">
            <Button 
              type="submit" 
              className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              disabled={isLoading}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {isLoading ? "Generating..." : "Generate Quote Preview"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
