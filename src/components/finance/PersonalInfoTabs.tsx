
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PersonalInfoForm from '@/components/finance/PersonalInfoForm';
import BusinessInfoForm from '@/components/finance/BusinessInfoForm';

interface PersonalInfoTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const PersonalInfoTabs = ({ activeTab, setActiveTab }: PersonalInfoTabsProps) => {
  return (
    <Card>
      <CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="business">Business Info</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="personal">
            <PersonalInfoForm />
          </TabsContent>
          <TabsContent value="business">
            <BusinessInfoForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoTabs;
