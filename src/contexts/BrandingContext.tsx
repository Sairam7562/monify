
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the type for branding settings
export interface BrandingSettings {
  platformName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  favicon: string;
  showLogo: boolean;
  customFonts: boolean;
  customCSS: string;
  metaTitle: string;
  metaDescription: string;
  footerText: string;
}

// Default branding settings
const defaultBrandingSettings: BrandingSettings = {
  platformName: 'Monify',
  tagline: 'Your Personal Financial Freedom Assistant',
  primaryColor: '#7C3AED', // monify-purple-600
  secondaryColor: '#DB2777', // monify-pink-600
  accentColor: '#06B6D4', // monify-cyan-500
  logo: '/path/to/current-logo.png',
  favicon: '/path/to/favicon.ico',
  showLogo: true,
  customFonts: true,
  customCSS: '',
  metaTitle: 'Monify - Personal & Business Finance Management',
  metaDescription: 'Manage your personal and business finances, track assets, liabilities, and grow your wealth with intelligent financial insights.',
  footerText: '© 2023 Monify. All rights reserved.'
};

// Create context with default values
type BrandingContextType = {
  brandingSettings: BrandingSettings;
  updateBrandingSettings: (settings: Partial<BrandingSettings>) => void;
  applyBrandingSettings: () => void;
};

const BrandingContext = createContext<BrandingContextType>({
  brandingSettings: defaultBrandingSettings,
  updateBrandingSettings: () => {},
  applyBrandingSettings: () => {},
});

export const useBranding = () => useContext(BrandingContext);

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(defaultBrandingSettings);
  
  // Load saved settings on initial render
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('brandingSettings');
      if (savedSettings) {
        setBrandingSettings(JSON.parse(savedSettings));
        applySettingsToDOM(JSON.parse(savedSettings));
      }
    };
    
    loadSettings();
  }, []);
  
  // Update settings partially or fully
  const updateBrandingSettings = (settings: Partial<BrandingSettings>) => {
    setBrandingSettings(prev => {
      const updatedSettings = { ...prev, ...settings };
      localStorage.setItem('brandingSettings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };
  
  // Apply settings to DOM and document
  const applyBrandingSettings = () => {
    applySettingsToDOM(brandingSettings);
  };
  
  // Helper function to apply settings to DOM
  const applySettingsToDOM = (settings: BrandingSettings) => {
    // Update colors in CSS variables
    document.documentElement.style.setProperty('--primary', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary', settings.secondaryColor);
    document.documentElement.style.setProperty('--accent', settings.accentColor);
    
    // Update document metadata
    document.title = settings.metaTitle;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', settings.metaDescription);
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = settings.metaDescription;
      document.head.appendChild(newMetaDescription);
    }
    
    // Apply custom CSS if enabled
    const existingCustomStyle = document.getElementById('custom-branding-css');
    if (existingCustomStyle) {
      existingCustomStyle.remove();
    }
    
    if (settings.customCSS) {
      const customStyle = document.createElement('style');
      customStyle.id = 'custom-branding-css';
      customStyle.textContent = settings.customCSS;
      document.head.appendChild(customStyle);
    }
    
    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon && settings.favicon) {
      favicon.setAttribute('href', settings.favicon);
    }
  };
  
  return (
    <BrandingContext.Provider value={{ 
      brandingSettings, 
      updateBrandingSettings,
      applyBrandingSettings
    }}>
      {children}
    </BrandingContext.Provider>
  );
};
