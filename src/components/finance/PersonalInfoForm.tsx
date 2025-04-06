
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDatabase } from '@/hooks/useDatabase';
import ProfileImageUploader from './ProfileImageUploader';
import { toast } from 'sonner';

// Define schema for personal information
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  birthDate: z.date().optional(),
  occupation: z.string().optional(),
  annualIncome: z.string().regex(/^\d*(\.\d{1,2})?$/, "Please enter a valid amount").optional(),
  profileImage: z.string().nullable().optional(),
});

type PersonalInfoFormProps = {
  onSave?: () => void;
};

const PersonalInfoForm = ({ onSave }: PersonalInfoFormProps) => {
  const { user } = useAuth();
  const { savePersonalInfo, fetchPersonalInfo, loading, hasSchemaIssue } = useDatabase();
  const [isSaving, setIsSaving] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      birthDate: undefined,
      occupation: '',
      annualIncome: '',
      profileImage: null,
    },
  });

  // Set a timeout to force initialization after 3 seconds to prevent UI from being stuck
  useEffect(() => {
    if (!formInitialized) {
      const timeout = setTimeout(() => {
        console.log("Form initialization timeout triggered");
        setFormInitialized(true);
      }, 3000);
      
      setLoadingTimeout(timeout);
      
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [formInitialized]);

  // Check network status
  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial state
    setOfflineMode(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Track database schema issues
  useEffect(() => {
    if (hasSchemaIssue && !offlineMode) {
      setOfflineMode(true);
    }
  }, [hasSchemaIssue]);

  useEffect(() => {
    const loadPersonalInfo = async () => {
      if (!user) return;
      try {
        console.log("Loading personal info data...");
        const { data, localData } = await fetchPersonalInfo();
        
        // Reset the isSaving flag in case it was stuck from a previous attempt
        setIsSaving(false);
        
        if (data) {
          console.log("Personal info data loaded:", data);
          
          // Check if data is from local storage
          if (localData) {
            console.log("Using local data");
            setOfflineMode(true);
          }
          
          form.reset({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            occupation: data.occupation || '',
            annualIncome: data.annualIncome ? data.annualIncome.toString() : '',
            profileImage: data.profileImage || null,
          });
          
          // Find timestamp from localStorage for last saved info
          const userId = user.id?.toString();
          if (userId) {
            const metaKey = `personal_info_${userId}_meta`;
            const meta = localStorage.getItem(metaKey);
            if (meta) {
              try {
                const metaData = JSON.parse(meta);
                if (metaData.timestamp) {
                  setLastSaved(new Date(metaData.timestamp));
                }
              } catch (e) {
                console.warn("Error parsing metadata:", e);
              }
            }
          }
        }
        
        // Ensure form is now interactive regardless of result
        setFormInitialized(true);
        
        // Clear timeout if it exists
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          setLoadingTimeout(null);
        }
      } catch (err) {
        console.error("Error loading personal info:", err);
        // Ensure form is interactive even after error
        setFormInitialized(true);
        toast.error("Failed to load your information. You can still enter your details.");
      } finally {
        // Clear any saving state to ensure form isn't locked
        setIsSaving(false);
      }
    };
    
    loadPersonalInfo();
    
    return () => {
      // Clean up timeout if component unmounts
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [user, fetchPersonalInfo]);

  const onSubmit = async (values: z.infer<typeof personalInfoSchema>) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      console.log("Saving personal info:", values);
      
      // Set a timeout to reset the saving state after 10 seconds
      // in case the save operation gets stuck
      const saveTimeout = setTimeout(() => {
        console.log("Save timeout triggered - resetting saving state");
        setIsSaving(false);
        toast.error("Save operation timed out. Your data is stored locally.");
      }, 10000);
      
      const { success, localSaved } = await savePersonalInfo(values);
      
      // Clear the timeout since the operation completed
      clearTimeout(saveTimeout);
      
      if (success) {
        setLastSaved(new Date());
        toast.success(localSaved 
          ? "Personal information saved locally (offline mode)"
          : "Personal information saved successfully");
          
        // Call onSave callback if provided
        if (onSave) onSave();
      } else {
        toast.warning("Data saved locally due to connection issues");
      }
    } catch (err) {
      console.error("Error saving personal info:", err);
      toast.error("Failed to save your information. Please try again.");
    } finally {
      // Always ensure saving state is reset
      setIsSaving(false);
    }
  };

  const handleProfileImageChange = (imageUrl: string | null) => {
    form.setValue('profileImage', imageUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // If form is not initialized and also loading, show a message
  if (!formInitialized && loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-4">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {offlineMode && (
        <div className="rounded-md bg-amber-50 p-4 mb-4 border border-amber-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Offline Mode Active</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>Your changes will be saved locally and synchronized with the database when connection is restored.</p>
                {lastSaved && (
                  <p className="mt-1 text-xs">Last saved: {lastSaved.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <ProfileImageUploader 
              defaultImage={form.getValues('profileImage') || undefined} 
              onImageChange={handleProfileImageChange} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" type="email" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                      <Input placeholder="Occupation" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="annualIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Income</FormLabel>
                    <FormControl>
                      <Input placeholder="Annual Income" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <h3 className="text-lg font-medium mt-6 mb-4">Address Information</h3>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Address" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} disabled={isSaving} />
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
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} disabled={isSaving} />
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
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Zip Code" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-6">
                  <FormLabel>Birth Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSaving}
                        >
                          {field.value ? (
                            format(field.value, "PP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="flex items-center">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Personal Information"
              )}
            </Button>
          </div>
          
          {lastSaved && (
            <p className="text-xs text-muted-foreground text-right">
              Last saved: {lastSaved.toLocaleString()}
            </p>
          )}
        </form>
      </Form>
    </div>
  );
};

export default PersonalInfoForm;
