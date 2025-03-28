
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUsers from '@/components/admin/AdminUsers';
import AdminFeatures from '@/components/admin/AdminFeatures';
import AdminSecurity from '@/components/admin/AdminSecurity';
import AdminBackups from '@/components/admin/AdminBackups';
import AdminBranding from '@/components/admin/AdminBranding';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import { Shield, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MasterAdminPage = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-monify-purple-600" />
            <h1 className="text-2xl font-bold tracking-tight">Master Admin Dashboard</h1>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                  <Info className="h-4 w-4 mr-1" />
                  <span>Auto-save status</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Changes are saved automatically in some sections,<br/>while others have explicit save buttons.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <Tabs 
            defaultValue="users" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-6 mb-6">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="backups">Backups</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <AdminUsers />
            </TabsContent>
            
            <TabsContent value="features" className="space-y-4">
              <AdminFeatures />
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <AdminSecurity />
            </TabsContent>
            
            <TabsContent value="backups" className="space-y-4">
              <AdminBackups />
            </TabsContent>
            
            <TabsContent value="branding" className="space-y-4">
              <AdminBranding />
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <AdminAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default MasterAdminPage;
