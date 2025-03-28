
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  occupation: string;
  employmentStatus: string;
  annualIncome: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  additionalNotes: string;
}

const PersonalInfoForm = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    occupation: '',
    employmentStatus: 'employed',
    annualIncome: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(personalInfo);
    // Here you would typically send this data to your API
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Enter your personal details to create personalized financial statements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={personalInfo.dateOfBirth}
                onChange={handleChange}
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
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={personalInfo.address}
              onChange={handleChange}
              placeholder="123 Main St"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          
          <Button type="submit" className="w-full bg-navido-blue-500 hover:bg-navido-blue-600">
            Save Personal Information
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;
