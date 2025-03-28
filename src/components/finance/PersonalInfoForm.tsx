
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface PersonalInfo {
  // Personal Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | undefined;
  ssn: string;
  occupation: string;
  employmentStatus: string;
  annualIncome: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Business Details
  hasBusinesses: boolean;
  businessName: string;
  businessType: string;
  taxId: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  businessCountry: string;
  
  // Additional
  additionalNotes: string;
}

const PersonalInfoForm = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: undefined,
    ssn: '',
    occupation: '',
    employmentStatus: 'employed',
    annualIncome: '',
    
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    
    hasBusinesses: false,
    businessName: '',
    businessType: 'sole_proprietorship',
    taxId: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessZipCode: '',
    businessCountry: 'US',
    
    additionalNotes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setPersonalInfo((prev) => ({ ...prev, dateOfBirth: date }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(personalInfo);
    // Here you would typically send this data to your API
    toast.success("Personal information saved successfully!");
  };

  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="personal">Personal Details</TabsTrigger>
        <TabsTrigger value="business">Business Details</TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Enter your personal details to create personalized financial statements.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={personalInfo.phone}
                    onChange={handleChange}
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {personalInfo.dateOfBirth ? (
                          format(personalInfo.dateOfBirth, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={personalInfo.dateOfBirth}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ssn">SSN (Optional)</Label>
                  <Input
                    id="ssn"
                    name="ssn"
                    type="password"
                    value={personalInfo.ssn}
                    onChange={handleChange}
                    placeholder="XXX-XX-XXXX"
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={personalInfo.occupation}
                    onChange={handleChange}
                    placeholder="Software Developer"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select 
                    value={personalInfo.employmentStatus} 
                    onValueChange={(value) => handleSelectChange('employmentStatus', value)}
                  >
                    <SelectTrigger id="employmentStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self_employed">Self-Employed</SelectItem>
                      <SelectItem value="business_owner">Business Owner</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income ($)</Label>
                  <Input
                    id="annualIncome"
                    name="annualIncome"
                    type="number"
                    value={personalInfo.annualIncome}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Address Information</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={personalInfo.address}
                      onChange={handleChange}
                      placeholder="123 Main St"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={personalInfo.city}
                        onChange={handleChange}
                        placeholder="New York"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        name="state"
                        value={personalInfo.state}
                        onChange={handleChange}
                        placeholder="NY"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={personalInfo.zipCode}
                        onChange={handleChange}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={personalInfo.country} 
                      onValueChange={(value) => handleSelectChange('country', value)}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="BR">Brazil</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasBusinesses" 
                  checked={personalInfo.hasBusinesses}
                  onCheckedChange={(checked) => handleCheckboxChange('hasBusinesses', checked as boolean)}
                />
                <label
                  htmlFor="hasBusinesses"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have a business or I'm self-employed
                </label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={personalInfo.additionalNotes}
                  onChange={handleChange}
                  placeholder="Any additional information you'd like to include..."
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-monify-purple-500 hover:bg-monify-purple-600">
                Save Personal Information
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      
      <TabsContent value="business">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Enter your business details to create business financial statements.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={personalInfo.businessName}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    required={personalInfo.hasBusinesses}
                    disabled={!personalInfo.hasBusinesses}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select 
                    value={personalInfo.businessType} 
                    onValueChange={(value) => handleSelectChange('businessType', value)}
                    disabled={!personalInfo.hasBusinesses}
                  >
                    <SelectTrigger id="businessType">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="s_corporation">S Corporation</SelectItem>
                      <SelectItem value="nonprofit">Nonprofit Organization</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  type="password"
                  value={personalInfo.taxId}
                  onChange={handleChange}
                  placeholder="XX-XXXXXXX"
                  autoComplete="off"
                  disabled={!personalInfo.hasBusinesses}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Business Address</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Street Address</Label>
                    <Input
                      id="businessAddress"
                      name="businessAddress"
                      value={personalInfo.businessAddress}
                      onChange={handleChange}
                      placeholder="456 Business Ave"
                      disabled={!personalInfo.hasBusinesses}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessCity">City</Label>
                      <Input
                        id="businessCity"
                        name="businessCity"
                        value={personalInfo.businessCity}
                        onChange={handleChange}
                        placeholder="New York"
                        disabled={!personalInfo.hasBusinesses}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessState">State/Province</Label>
                      <Input
                        id="businessState"
                        name="businessState"
                        value={personalInfo.businessState}
                        onChange={handleChange}
                        placeholder="NY"
                        disabled={!personalInfo.hasBusinesses}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessZipCode">ZIP/Postal Code</Label>
                      <Input
                        id="businessZipCode"
                        name="businessZipCode"
                        value={personalInfo.businessZipCode}
                        onChange={handleChange}
                        placeholder="10001"
                        disabled={!personalInfo.hasBusinesses}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessCountry">Country</Label>
                    <Select 
                      value={personalInfo.businessCountry} 
                      onValueChange={(value) => handleSelectChange('businessCountry', value)}
                      disabled={!personalInfo.hasBusinesses}
                    >
                      <SelectTrigger id="businessCountry">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="BR">Brazil</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-monify-purple-500 hover:bg-monify-purple-600"
                disabled={!personalInfo.hasBusinesses}
              >
                Save Business Information
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default PersonalInfoForm;
