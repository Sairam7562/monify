
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Palette, Image, Type, Globe, 
  LayoutGrid, FileEdit, Save, Undo, Check
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useBranding } from '@/contexts/BrandingContext';

const AdminBranding = () => {
  const { brandingSettings, updateBrandingSettings, applyBrandingSettings } = useBranding();
  const [localSettings, setLocalSettings] = useState({...brandingSettings});
  
  const [previewColors, setPreviewColors] = useState({
    primary: brandingSettings.primaryColor,
    secondary: brandingSettings.secondaryColor,
    accent: brandingSettings.accentColor
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  
  // Sync with context when it changes
  useEffect(() => {
    setLocalSettings({...brandingSettings});
    setPreviewColors({
      primary: brandingSettings.primaryColor,
      secondary: brandingSettings.secondaryColor,
      accent: brandingSettings.accentColor
    });
  }, [brandingSettings]);
  
  const handleColorChange = (colorType, value) => {
    setPreviewColors(prev => ({
      ...prev,
      [colorType]: value
    }));
    setHasUnsavedChanges(true);
  };
  
  const handleColorApply = () => {
    setLocalSettings(prev => ({
      ...prev,
      primaryColor: previewColors.primary,
      secondaryColor: previewColors.secondary,
      accentColor: previewColors.accent
    }));
    setHasUnsavedChanges(true);
    
    toast({
      title: "Colors Updated",
      description: "Color scheme has been updated. Don't forget to save all changes."
    });
  };
  
  const handleInputChange = (setting, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    setHasUnsavedChanges(true);
  };
  
  const saveAllChanges = () => {
    // Update global branding settings
    updateBrandingSettings(localSettings);
    
    // Explicitly call apply to ensure changes take effect
    applyBrandingSettings();
    
    setHasUnsavedChanges(false);
    
    toast({
      title: "Settings Saved",
      description: "All branding settings have been saved and applied to the entire site.",
      action: (
        <div className="flex items-center">
          <Check className="h-4 w-4 text-green-500 mr-1" />
          <span>Applied</span>
        </div>
      ),
    });
  };
  
  const cancelChanges = () => {
    // Reset to current global settings
    setLocalSettings({...brandingSettings});
    setPreviewColors({
      primary: brandingSettings.primaryColor,
      secondary: brandingSettings.secondaryColor,
      accent: brandingSettings.accentColor
    });
    setHasUnsavedChanges(false);
    
    toast({
      title: "Changes Discarded",
      description: "All unsaved changes have been discarded."
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Customization & Branding</h2>
        {hasUnsavedChanges && (
          <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded text-sm border border-amber-200">
            You have unsaved changes
          </div>
        )}
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <FileEdit className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-1">
            <LayoutGrid className="h-4 w-4" />
            <span>SEO & Meta</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Identity</CardTitle>
              <CardDescription>Configure your platform name and basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input 
                  id="platform-name" 
                  value={localSettings.platformName}
                  onChange={(e) => handleInputChange('platformName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input 
                  id="tagline" 
                  value={localSettings.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                />
                <p className="text-xs text-gray-500">Short phrase that appears on the landing page and in emails</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="footer-text">Footer Text</Label>
                <Input 
                  id="footer-text" 
                  value={localSettings.footerText}
                  onChange={(e) => handleInputChange('footerText', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Logo & Images</CardTitle>
              <CardDescription>Upload and manage your platform visuals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Platform Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                  <Button variant="outline">Upload New Logo</Button>
                </div>
                <p className="text-xs text-gray-500">Recommended size: 200x50px, PNG or SVG format</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="favicon-upload">Favicon</Label>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                    <Image className="h-4 w-4 text-gray-400" />
                  </div>
                  <Button variant="outline">Upload Favicon</Button>
                </div>
                <p className="text-xs text-gray-500">Must be 32x32px, ICO or PNG format</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-logo" className="font-medium">Show Logo in Navigation</Label>
                  <p className="text-sm text-gray-500">Display logo in the platform navigation bar</p>
                </div>
                <Switch
                  id="show-logo"
                  checked={localSettings.showLogo}
                  onCheckedChange={(checked) => handleInputChange('showLogo', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Customize the platform color palette</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-10 w-10 rounded border" 
                      style={{ backgroundColor: previewColors.primary }}
                    />
                    <Input 
                      id="primary-color" 
                      type="text"
                      value={previewColors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-10 w-10 rounded border" 
                      style={{ backgroundColor: previewColors.secondary }}
                    />
                    <Input 
                      id="secondary-color" 
                      type="text"
                      value={previewColors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-10 w-10 rounded border" 
                      style={{ backgroundColor: previewColors.accent }}
                    />
                    <Input 
                      id="accent-color" 
                      type="text"
                      value={previewColors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg mb-4">
                <h3 className="font-medium mb-3">Preview</h3>
                <div className="flex flex-col gap-2">
                  <div className="h-8 rounded" style={{ backgroundColor: previewColors.primary }}></div>
                  <div className="h-8 rounded" style={{ backgroundColor: previewColors.secondary }}></div>
                  <div className="h-8 rounded" style={{ backgroundColor: previewColors.accent }}></div>
                  <div className="flex gap-2 mt-2">
                    <Button style={{ backgroundColor: previewColors.primary, color: 'white' }}>Primary Button</Button>
                    <Button style={{ backgroundColor: previewColors.secondary, color: 'white' }}>Secondary</Button>
                    <Button style={{ backgroundColor: previewColors.accent, color: 'white' }}>Accent</Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewColors({
                  primary: localSettings.primaryColor,
                  secondary: localSettings.secondaryColor,
                  accent: localSettings.accentColor
                })}>
                  <Undo className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button onClick={handleColorApply}>
                  <Save className="h-4 w-4 mr-1" />
                  Apply Colors
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Typography & Styling</CardTitle>
              <CardDescription>Customize fonts and advanced styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="custom-fonts" className="font-medium">Use Custom Fonts</Label>
                  <p className="text-sm text-gray-500">Enable custom font families</p>
                </div>
                <Switch
                  id="custom-fonts"
                  checked={localSettings.customFonts}
                  onCheckedChange={(checked) => handleInputChange('customFonts', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea 
                  id="custom-css" 
                  rows={6}
                  placeholder="/* Add your custom CSS here */"
                  value={localSettings.customCSS}
                  onChange={(e) => handleInputChange('customCSS', e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">Advanced: Add custom CSS styles to override platform appearance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Landing Page Content</CardTitle>
              <CardDescription>Edit the content displayed on your public landing page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Hero Title</Label>
                <Input 
                  id="hero-title" 
                  placeholder="Enter hero title"
                  defaultValue="Take Control of Your Financial Future"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                <Textarea 
                  id="hero-subtitle" 
                  placeholder="Enter hero subtitle"
                  defaultValue="The all-in-one platform for managing personal and business finances, tracking assets and liabilities, and building wealth with intelligent insights."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feature-sections">Feature Sections</Label>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Manage feature sections in the content editor:</p>
                  <Button variant="outline">Open Content Editor</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testimonials">Testimonials</Label>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Manage customer testimonials:</p>
                  <Button variant="outline">Manage Testimonials</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Legal Content</CardTitle>
              <CardDescription>Update terms of service and privacy policy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms-service">Terms of Service</Label>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Edit your terms of service document:</p>
                  <Button variant="outline">Edit Terms of Service</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="privacy-policy">Privacy Policy</Label>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Edit your privacy policy document:</p>
                  <Button variant="outline">Edit Privacy Policy</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="seo" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your platform for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input 
                  id="meta-title" 
                  value={localSettings.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                />
                <p className="text-xs text-gray-500">Appears in browser tabs and search results (max 60 characters)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea 
                  id="meta-description" 
                  rows={3}
                  value={localSettings.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                />
                <p className="text-xs text-gray-500">Summary shown in search engine results (max 160 characters)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="canonical-url">Canonical URL</Label>
                <Input 
                  id="canonical-url" 
                  placeholder="https://www.yourdomain.com"
                  defaultValue="https://www.monify.com"
                />
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Analytics Integration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Google Analytics</p>
                      <p className="text-sm text-gray-500">Track website traffic and user behavior</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Google Tag Manager</p>
                      <p className="text-sm text-gray-500">Manage marketing and tracking tags</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Configure social media sharing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="og-title">Open Graph Title</Label>
                <Input 
                  id="og-title" 
                  placeholder="Title for social media sharing"
                  defaultValue="Monify - Smart Financial Management"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="og-description">Open Graph Description</Label>
                <Textarea 
                  id="og-description" 
                  rows={2}
                  placeholder="Description for social media sharing"
                  defaultValue="Take control of your finances with the smartest personal and business financial management platform."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="og-image">Social Share Image</Label>
                <div className="flex items-center gap-2">
                  <div className="h-16 w-32 bg-gray-100 rounded flex items-center justify-center">
                    <Image className="h-6 w-6 text-gray-400" />
                  </div>
                  <Button variant="outline">Upload Image</Button>
                </div>
                <p className="text-xs text-gray-500">Recommended size: 1200x630px</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={cancelChanges} 
          disabled={!hasUnsavedChanges}
        >
          Cancel Changes
        </Button>
        <Button 
          onClick={saveAllChanges} 
          disabled={!hasUnsavedChanges}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-1" />
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminBranding;
