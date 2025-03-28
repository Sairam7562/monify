
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle } from 'lucide-react';

// Define schema for business information
const businessSchema = z.object({
  includeInStatements: z.boolean().default(true),
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  taxId: z.string().optional(),
  yearEstablished: z.string().regex(/^\d{4}$/, "Please enter a valid year").optional(),
  employeeCount: z.string().regex(/^\d+$/, "Please enter a valid number").optional(),
  annualRevenue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount").optional(),
  streetAddress: z.string().optional(),
  suite: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

type BusinessInfoFormProps = {
  onSave?: () => void;
};

const BusinessInfoForm = ({ onSave }: BusinessInfoFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveBusinessInfo, fetchBusinessInfo, loading } = useDatabase();
  const [hasBusinessInfo, setHasBusinessInfo] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [currentBusinessIndex, setCurrentBusinessIndex] = useState(0);

  const form = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      includeInStatements: true,
      businessName: '',
      businessType: '',
      taxId: '',
      yearEstablished: '',
      employeeCount: '',
      annualRevenue: '',
      streetAddress: '',
      suite: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
  });

  useEffect(() => {
    const loadBusinessInfo = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await fetchBusinessInfo();
        
        if (error) {
          console.error("Error fetching business info:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setBusinesses(data);
          setHasBusinessInfo(true);
          
          // Set form values for the first business
          const business = data[0];
          form.reset({
            includeInStatements: business.include_in_statements || true,
            businessName: business.business_name || '',
            businessType: business.business_type || '',
            taxId: business.tax_id || '',
            yearEstablished: business.year_established?.toString() || '',
            employeeCount: business.employee_count?.toString() || '',
            annualRevenue: business.annual_revenue?.toString() || '',
            streetAddress: business.street_address || '',
            suite: business.suite || '',
            city: business.city || '',
            state: business.state || '',
            zipCode: business.zip_code || '',
            country: business.country || 'United States',
          });
        }
      } catch (err) {
        console.error("Error in loadBusinessInfo:", err);
      }
    };
    
    loadBusinessInfo();
  }, [user, fetchBusinessInfo]);

  const onSubmit = async (values: z.infer<typeof businessSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to save business information",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const businessData = {
        include_in_statements: values.includeInStatements,
        business_name: values.businessName,
        business_type: values.businessType,
        tax_id: values.taxId,
        year_established: values.yearEstablished ? parseInt(values.yearEstablished) : null,
        employee_count: values.employeeCount ? parseInt(values.employeeCount) : null,
        annual_revenue: values.annualRevenue ? parseFloat(values.annualRevenue) : null,
        street_address: values.streetAddress,
        suite: values.suite,
        city: values.city,
        state: values.state,
        zip_code: values.zipCode,
        country: values.country,
      };
      
      let updatedBusinesses = [...businesses];
      
      if (currentBusinessIndex < businesses.length) {
        // Update existing business
        updatedBusinesses[currentBusinessIndex] = {
          ...updatedBusinesses[currentBusinessIndex],
          ...businessData,
        };
      } else {
        // Add new business
        updatedBusinesses.push(businessData);
      }
      
      const { error } = await saveBusinessInfo(updatedBusinesses);
      
      if (error) {
        console.error("Error saving business info:", error);
        toast({
          title: "Error",
          description: "Failed to save business information",
          variant: "destructive",
        });
        return;
      }
      
      setBusinesses(updatedBusinesses);
      setHasBusinessInfo(true);
      
      toast({
        title: "Success",
        description: "Business information saved successfully",
      });
      
      if (onSave) onSave();
      
    } catch (err) {
      console.error("Error in onSubmit:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAddBusiness = () => {
    // Save current business first if form is dirty
    if (form.formState.isDirty) {
      form.handleSubmit(onSubmit)();
    }
    
    // Clear form for new business
    form.reset({
      includeInStatements: true,
      businessName: '',
      businessType: '',
      taxId: '',
      yearEstablished: '',
      employeeCount: '',
      annualRevenue: '',
      streetAddress: '',
      suite: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    });
    
    setCurrentBusinessIndex(businesses.length);
  };

  const handleSwitchBusiness = (index: number) => {
    // Save current business first if form is dirty
    if (form.formState.isDirty) {
      form.handleSubmit(onSubmit)();
    }
    
    if (index >= 0 && index < businesses.length) {
      const business = businesses[index];
      form.reset({
        includeInStatements: business.include_in_statements,
        businessName: business.business_name || '',
        businessType: business.business_type || '',
        taxId: business.tax_id || '',
        yearEstablished: business.year_established?.toString() || '',
        employeeCount: business.employee_count?.toString() || '',
        annualRevenue: business.annual_revenue?.toString() || '',
        streetAddress: business.street_address || '',
        suite: business.suite || '',
        city: business.city || '',
        state: business.state || '',
        zipCode: business.zip_code || '',
        country: business.country || 'United States',
      });
      
      setCurrentBusinessIndex(index);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {businesses.length > 0 && (
                <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                  <div className="font-medium">Your Businesses:</div>
                  <div className="flex flex-wrap gap-2">
                    {businesses.map((business, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={index === currentBusinessIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSwitchBusiness(index)}
                      >
                        {business.business_name || `Business ${index + 1}`}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddBusiness}
                      className="flex items-center"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" /> Add Another Business
                    </Button>
                  </div>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="includeInStatements"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Include this business in financial statements</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="Partnership">Partnership</SelectItem>
                          <SelectItem value="LLC">LLC</SelectItem>
                          <SelectItem value="Corporation">Corporation</SelectItem>
                          <SelectItem value="S-Corporation">S-Corporation</SelectItem>
                          <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID / EIN</FormLabel>
                      <FormControl>
                        <Input placeholder="XX-XXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="yearEstablished"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Established</FormLabel>
                      <FormControl>
                        <Input placeholder="2020" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="employeeCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Employees</FormLabel>
                      <FormControl>
                        <Input placeholder="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="annualRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Revenue ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="500000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h3 className="text-lg font-medium mt-6 mb-4">Business Address</h3>
              
              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Business Ave" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="suite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suite, Unit, etc.</FormLabel>
                    <FormControl>
                      <Input placeholder="Suite 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP/Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Japan">Japan</SelectItem>
                        <SelectItem value="China">China</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Business Information"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {!hasBusinessInfo && businesses.length === 0 && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleAddBusiness}
          className="flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Business Information
        </Button>
      )}
    </div>
  );
};

export default BusinessInfoForm;
