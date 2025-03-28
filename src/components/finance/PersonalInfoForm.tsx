
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
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import ProfileImageUploader from './ProfileImageUploader';

interface PersonalInfo {
  // Personal Details
  profileImage: string | null;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  dateOfBirth: Date | undefined;
  ssn: string;
  occupation: string;
  employmentStatus: string;
  employerName: string;
  yearsWithEmployer: string;
  annualIncome: string;
  
  // Address
  address: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Spouse Information
  includeSpouse: boolean;
  spouseFirstName: string;
  spouseLastName: string;
  spouseMiddleName: string;
  spouseEmail: string;
  spousePhone: string;
  spouseDateOfBirth: Date | undefined;
  spouseSsn: string;
  spouseOccupation: string;
  spouseEmploymentStatus: string;
  spouseEmployerName: string;
  spouseYearsWithEmployer: string;
  spouseAnnualIncome: string;
  
  // Business Details
  hasBusinesses: boolean;
  businesses: Business[];
  
  // Additional
  additionalNotes: string;
}

interface Business {
  id: number;
  businessName: string;
  businessType: string;
  taxId: string;
  businessAddress: string;
  businessAddress2: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  businessCountry: string;
  yearEstablished: string;
  numberOfEmployees: string;
  annualRevenue: string;
  includeInReports: boolean;
}

const PersonalInfoForm = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    profileImage: null,
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: undefined,
    ssn: '',
    occupation: '',
    employmentStatus: 'employed',
    employerName: '',
    yearsWithEmployer: '',
    annualIncome: '',
    
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    
    includeSpouse: false,
    spouseFirstName: '',
    spouseLastName: '',
    spouseMiddleName: '',
    spouseEmail: '',
    spousePhone: '',
    spouseDateOfBirth: undefined,
    spouseSsn: '',
    spouseOccupation: '',
    spouseEmploymentStatus: 'employed',
    spouseEmployerName: '',
    spouseYearsWithEmployer: '',
    spouseAnnualIncome: '',
    
    hasBusinesses: false,
    businesses: [
      {
        id: 1,
        businessName: '',
        businessType: 'sole_proprietorship',
        taxId: '',
        businessAddress: '',
        businessAddress2: '',
        businessCity: '',
        businessState: '',
        businessZipCode: '',
        businessCountry: 'US',
        yearEstablished: '',
        numberOfEmployees: '',
        annualRevenue: '',
        includeInReports: true
      }
    ],
    
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

  const handleSpouseDateChange = (date: Date | undefined) => {
    setPersonalInfo((prev) => ({ ...prev, spouseDateOfBirth: date }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: checked }));
  };

  const handleProfileImageChange = (imageUrl: string | null) => {
    setPersonalInfo(prev => ({ ...prev, profileImage: imageUrl }));
  };

  // Business methods
  const addBusiness = () => {
    const newId = personalInfo.businesses.length > 0 
      ? Math.max(...personalInfo.businesses.map(b => b.id)) + 1 
      : 1;
    
    const newBusiness: Business = {
      id: newId,
      businessName: '',
      businessType: 'sole_proprietorship',
      taxId: '',
      businessAddress: '',
      businessAddress2: '',
      businessCity: '',
      businessState: '',
      businessZipCode: '',
      businessCountry: 'US',
      yearEstablished: '',
      numberOfEmployees: '',
      annualRevenue: '',
      includeInReports: true
    };
    
    setPersonalInfo(prev => ({
      ...prev,
      businesses: [...prev.businesses, newBusiness]
    }));

    // If this is beyond the first free business, show payment info
    if (personalInfo.businesses.length >= 1) {
      toast.info("Additional businesses are $1.99 each. This will be added to your next invoice.");
    }
  };

  const removeBusiness = (id: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      businesses: prev.businesses.filter(business => business.id !== id)
    }));
  };

  const updateBusiness = (id: number, field: keyof Business, value: string | boolean) => {
    setPersonalInfo(prev => ({
      ...prev,
      businesses: prev.businesses.map(business => 
        business.id === id ? { ...business, [field]: value } : business
      )
    }));
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <ProfileImageUploader 
                    defaultImage={personalInfo.profileImage || undefined}
                    onImageChange={handleProfileImageChange}
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
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
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input
                        id="middleName"
                        name="middleName"
                        value={personalInfo.middleName}
                        onChange={handleChange}
                        placeholder="David"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
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
                      <Label htmlFor="phone">Primary Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={personalInfo.phone}
                        onChange={handleChange}
                        placeholder="(123) 456-7890"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input
                  id="alternatePhone"
                  name="alternatePhone"
                  value={personalInfo.alternatePhone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
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
                  <Label htmlFor="ssn">SSN (Last 4 Digits Only)</Label>
                  <Input
                    id="ssn"
                    name="ssn"
                    type="password"
                    value={personalInfo.ssn}
                    onChange={handleChange}
                    placeholder="XXX-XX-XXXX"
                    autoComplete="off"
                    maxLength={4}
                  />
                  <p className="text-xs text-muted-foreground">For verification purposes only. Encrypted and secure.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={personalInfo.occupation}
                    onChange={handleChange}
                    placeholder="Software Developer"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status *</Label>
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
                  <Label htmlFor="employerName">Employer Name</Label>
                  <Input
                    id="employerName"
                    name="employerName"
                    value={personalInfo.employerName}
                    onChange={handleChange}
                    placeholder="Acme Inc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="yearsWithEmployer">Years with Employer</Label>
                  <Input
                    id="yearsWithEmployer"
                    name="yearsWithEmployer"
                    type="number"
                    value={personalInfo.yearsWithEmployer}
                    onChange={handleChange}
                    placeholder="5"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="annualIncome">Annual Income ($) *</Label>
                <Input
                  id="annualIncome"
                  name="annualIncome"
                  type="number"
                  value={personalInfo.annualIncome}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Address Information</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={personalInfo.address}
                      onChange={handleChange}
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address2">Apartment, Suite, etc.</Label>
                    <Input
                      id="address2"
                      name="address2"
                      value={personalInfo.address2}
                      onChange={handleChange}
                      placeholder="Apt #204"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={personalInfo.city}
                        onChange={handleChange}
                        placeholder="New York"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={personalInfo.state}
                        onChange={handleChange}
                        placeholder="NY"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={personalInfo.zipCode}
                        onChange={handleChange}
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
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
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeSpouse" 
                    checked={personalInfo.includeSpouse}
                    onCheckedChange={(checked) => handleCheckboxChange('includeSpouse', checked as boolean)}
                  />
                  <label
                    htmlFor="includeSpouse"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include spouse information in financial statements
                  </label>
                </div>
                
                {personalInfo.includeSpouse && (
                  <div className="border p-4 rounded-md space-y-4">
                    <h3 className="text-lg font-medium">Spouse Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="spouseFirstName">First Name *</Label>
                        <Input
                          id="spouseFirstName"
                          name="spouseFirstName"
                          value={personalInfo.spouseFirstName}
                          onChange={handleChange}
                          placeholder="Jane"
                          required={personalInfo.includeSpouse}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="spouseMiddleName">Middle Name</Label>
                        <Input
                          id="spouseMiddleName"
                          name="spouseMiddleName"
                          value={personalInfo.spouseMiddleName}
                          onChange={handleChange}
                          placeholder="Marie"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="spouseLastName">Last Name *</Label>
                        <Input
                          id="spouseLastName"
                          name="spouseLastName"
                          value={personalInfo.spouseLastName}
                          onChange={handleChange}
                          placeholder="Doe"
                          required={personalInfo.includeSpouse}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="spouseEmail">Email</Label>
                        <Input
                          id="spouseEmail"
                          name="spouseEmail"
                          type="email"
                          value={personalInfo.spouseEmail}
                          onChange={handleChange}
                          placeholder="jane.doe@example.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="spousePhone">Phone</Label>
                        <Input
                          id="spousePhone"
                          name="spousePhone"
                          value={personalInfo.spousePhone}
                          onChange={handleChange}
                          placeholder="(123) 456-7890"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="spouseDateOfBirth">Date of Birth</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {personalInfo.spouseDateOfBirth ? (
                                format(personalInfo.spouseDateOfBirth, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={personalInfo.spouseDateOfBirth}
                              onSelect={handleSpouseDateChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="spouseSsn">SSN (Last 4 Digits Only)</Label>
                        <Input
                          id="spouseSsn"
                          name="spouseSsn"
                          type="password"
                          value={personalInfo.spouseSsn}
                          onChange={handleChange}
                          placeholder="XXX-XX-XXXX"
                          autoComplete="off"
                          maxLength={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="spouseOccupation">Occupation</Label>
                        <Input
                          id="spouseOccupation"
                          name="spouseOccupation"
                          value={personalInfo.spouseOccupation}
                          onChange={handleChange}
                          placeholder="Marketing Manager"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="spouseEmploymentStatus">Employment Status</Label>
                        <Select 
                          value={personalInfo.spouseEmploymentStatus} 
                          onValueChange={(value) => handleSelectChange('spouseEmploymentStatus', value)}
                        >
                          <SelectTrigger id="spouseEmploymentStatus">
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
                        <Label htmlFor="spouseEmployerName">Employer Name</Label>
                        <Input
                          id="spouseEmployerName"
                          name="spouseEmployerName"
                          value={personalInfo.spouseEmployerName}
                          onChange={handleChange}
                          placeholder="XYZ Corporation"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="spouseYearsWithEmployer">Years with Employer</Label>
                        <Input
                          id="spouseYearsWithEmployer"
                          name="spouseYearsWithEmployer"
                          type="number"
                          value={personalInfo.spouseYearsWithEmployer}
                          onChange={handleChange}
                          placeholder="3"
                          min="0"
                          step="0.5"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="spouseAnnualIncome">Annual Income ($)</Label>
                      <Input
                        id="spouseAnnualIncome"
                        name="spouseAnnualIncome"
                        type="number"
                        value={personalInfo.spouseAnnualIncome}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                )}
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
              {personalInfo.hasBusinesses ? (
                <>
                  {personalInfo.businesses.map((business, index) => (
                    <div key={business.id} className="border rounded-lg p-5 space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">
                          Business #{index + 1}: {business.businessName || 'New Business'}
                        </h3>
                        {personalInfo.businesses.length > 1 && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeBusiness(business.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Business
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`includeInReports-${business.id}`} 
                          checked={business.includeInReports}
                          onCheckedChange={(checked) => updateBusiness(business.id, 'includeInReports', checked as boolean)}
                        />
                        <label
                          htmlFor={`includeInReports-${business.id}`}
                          className="text-sm font-medium leading-none"
                        >
                          Include this business in financial statements
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor={`businessName-${business.id}`}>Business Name *</Label>
                          <Input
                            id={`businessName-${business.id}`}
                            value={business.businessName}
                            onChange={(e) => updateBusiness(business.id, 'businessName', e.target.value)}
                            placeholder="Acme Corporation"
                            required={personalInfo.hasBusinesses}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`businessType-${business.id}`}>Business Type *</Label>
                          <Select 
                            value={business.businessType} 
                            onValueChange={(value) => updateBusiness(business.id, 'businessType', value)}
                          >
                            <SelectTrigger id={`businessType-${business.id}`}>
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor={`taxId-${business.id}`}>Tax ID / EIN</Label>
                          <Input
                            id={`taxId-${business.id}`}
                            type="password"
                            value={business.taxId}
                            onChange={(e) => updateBusiness(business.id, 'taxId', e.target.value)}
                            placeholder="XX-XXXXXXX"
                            autoComplete="off"
                          />
                          <p className="text-xs text-muted-foreground">Encrypted and secure</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`yearEstablished-${business.id}`}>Year Established</Label>
                          <Input
                            id={`yearEstablished-${business.id}`}
                            type="number"
                            value={business.yearEstablished}
                            onChange={(e) => updateBusiness(business.id, 'yearEstablished', e.target.value)}
                            placeholder="2020"
                            min="1900"
                            max={new Date().getFullYear()}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`numberOfEmployees-${business.id}`}>Number of Employees</Label>
                          <Input
                            id={`numberOfEmployees-${business.id}`}
                            type="number"
                            value={business.numberOfEmployees}
                            onChange={(e) => updateBusiness(business.id, 'numberOfEmployees', e.target.value)}
                            placeholder="10"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`annualRevenue-${business.id}`}>Annual Revenue ($)</Label>
                        <Input
                          id={`annualRevenue-${business.id}`}
                          type="number"
                          value={business.annualRevenue}
                          onChange={(e) => updateBusiness(business.id, 'annualRevenue', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <h4 className="text-md font-medium mb-4">Business Address</h4>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`businessAddress-${business.id}`}>Street Address *</Label>
                            <Input
                              id={`businessAddress-${business.id}`}
                              value={business.businessAddress}
                              onChange={(e) => updateBusiness(business.id, 'businessAddress', e.target.value)}
                              placeholder="456 Business Ave"
                              required={personalInfo.hasBusinesses}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`businessAddress2-${business.id}`}>Suite, Unit, etc.</Label>
                            <Input
                              id={`businessAddress2-${business.id}`}
                              value={business.businessAddress2}
                              onChange={(e) => updateBusiness(business.id, 'businessAddress2', e.target.value)}
                              placeholder="Suite 300"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`businessCity-${business.id}`}>City *</Label>
                              <Input
                                id={`businessCity-${business.id}`}
                                value={business.businessCity}
                                onChange={(e) => updateBusiness(business.id, 'businessCity', e.target.value)}
                                placeholder="New York"
                                required={personalInfo.hasBusinesses}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`businessState-${business.id}`}>State/Province *</Label>
                              <Input
                                id={`businessState-${business.id}`}
                                value={business.businessState}
                                onChange={(e) => updateBusiness(business.id, 'businessState', e.target.value)}
                                placeholder="NY"
                                required={personalInfo.hasBusinesses}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`businessZipCode-${business.id}`}>ZIP/Postal Code *</Label>
                              <Input
                                id={`businessZipCode-${business.id}`}
                                value={business.businessZipCode}
                                onChange={(e) => updateBusiness(business.id, 'businessZipCode', e.target.value)}
                                placeholder="10001"
                                required={personalInfo.hasBusinesses}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`businessCountry-${business.id}`}>Country *</Label>
                            <Select 
                              value={business.businessCountry} 
                              onValueChange={(value) => updateBusiness(business.id, 'businessCountry', value)}
                            >
                              <SelectTrigger id={`businessCountry-${business.id}`}>
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
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addBusiness}
                    className="w-full flex items-center justify-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Another Business
                  </Button>
                  
                  {personalInfo.businesses.length > 1 && (
                    <p className="text-sm text-muted-foreground text-center">
                      First business is free. Additional businesses are $1.99 each.
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center p-12 border border-dashed rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No Business Information</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't indicated that you have a business. To add business information, 
                    please check the "I have a business" option on the Personal Details tab.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleCheckboxChange('hasBusinesses', true);
                      handleSelectChange('employmentStatus', 'business_owner');
                    }}
                  >
                    I Have a Business
                  </Button>
                </div>
              )}
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
