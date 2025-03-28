
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
import { CalendarIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDatabase } from '@/hooks/useDatabase';
import ProfileImageUploader from './ProfileImageUploader';

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
  const { savePersonalInfo, fetchPersonalInfo, loading } = useDatabase();
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    const loadPersonalInfo = async () => {
      if (!user) return;
      try {
        setIsSaving(true);
        const { data } = await fetchPersonalInfo();
        if (data) {
          console.log("Personal info data loaded:", data);
          form.reset({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            birthDate: data.birthDate,
            occupation: data.occupation || '',
            annualIncome: data.annualIncome ? data.annualIncome.toString() : '',
            profileImage: data.profileImage || null,
          });
        }
      } catch (err) {
        console.error("Error loading personal info:", err);
      } finally {
        setIsSaving(false);
      }
    };
    
    loadPersonalInfo();
  }, [user, fetchPersonalInfo]);

  const onSubmit = async (values: z.infer<typeof personalInfoSchema>) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      await savePersonalInfo(values);
      
      // Call onSave callback if provided
      if (onSave) onSave();
    } catch (err) {
      console.error("Error saving personal info:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileImageChange = (imageUrl: string | null) => {
    form.setValue('profileImage', imageUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-6">
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
                      <Input placeholder="First Name" {...field} />
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
                      <Input placeholder="Last Name" {...field} />
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
                      <Input placeholder="Email" type="email" {...field} />
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
                      <Input placeholder="Phone" {...field} />
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
                      <Input placeholder="Occupation" {...field} />
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
                      <Input placeholder="Annual Income" {...field} />
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
                    <Input placeholder="Address" {...field} />
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
                      <Input placeholder="City" {...field} />
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
                      <Input placeholder="State" {...field} />
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
                      <Input placeholder="Zip Code" {...field} />
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
            <Button type="submit" disabled={loading || isSaving}>
              {loading || isSaving ? "Saving..." : "Save Personal Information"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalInfoForm;
