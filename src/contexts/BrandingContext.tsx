
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
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setBrandingSettings(parsedSettings);
          // Apply the settings immediately when they're loaded
          applySettingsToDOM(parsedSettings);
        } catch (error) {
          console.error('Error parsing branding settings:', error);
          // If there's an error, apply defaults
          applySettingsToDOM(defaultBrandingSettings);
        }
      } else {
        // If no saved settings, apply defaults
        applySettingsToDOM(defaultBrandingSettings);
      }
    };
    
    loadSettings();
  }, []);
  
  // Update settings partially or fully
  const updateBrandingSettings = (settings: Partial<BrandingSettings>) => {
    setBrandingSettings(prev => {
      const updatedSettings = { ...prev, ...settings };
      // Save to localStorage
      localStorage.setItem('brandingSettings', JSON.stringify(updatedSettings));
      // Apply the changes immediately
      applySettingsToDOM(updatedSettings);
      return updatedSettings;
    });
  };
  
  // Apply settings to DOM and document
  const applyBrandingSettings = () => {
    applySettingsToDOM(brandingSettings);
  };
  
  // Helper function to apply settings to DOM
  const applySettingsToDOM = (settings: BrandingSettings) => {
    console.log("Applying branding settings to DOM:", settings);
    
    // Convert hex to HSL for CSS variables
    const hexToHSL = (hex) => {
      // Remove the # if present
      hex = hex.replace('#', '');
      
      // Convert hex to RGB
      let r = parseInt(hex.substring(0, 2), 16) / 255;
      let g = parseInt(hex.substring(2, 4), 16) / 255;
      let b = parseInt(hex.substring(4, 6), 16) / 255;
      
      // Find greatest and smallest channel values
      let cmin = Math.min(r, g, b);
      let cmax = Math.max(r, g, b);
      let delta = cmax - cmin;
      let h = 0;
      let s = 0;
      let l = 0;
      
      // Calculate hue
      if (delta === 0) h = 0;
      else if (cmax === r) h = ((g - b) / delta) % 6;
      else if (cmax === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      
      h = Math.round(h * 60);
      if (h < 0) h += 360;
      
      // Calculate lightness
      l = (cmax + cmin) / 2;
      
      // Calculate saturation
      s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
      
      // Convert to percentage
      s = +(s * 100).toFixed(1);
      l = +(l * 100).toFixed(1);
      
      return { h, s, l };
    };
    
    // Convert primary color to HSL
    const primaryHSL = hexToHSL(settings.primaryColor);
    const secondaryHSL = hexToHSL(settings.secondaryColor);
    const accentHSL = hexToHSL(settings.accentColor);
    
    // Update CSS custom properties for colors using HSL values
    document.documentElement.style.setProperty('--primary', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
    document.documentElement.style.setProperty('--primary-foreground', '210 40% 98%');
    
    document.documentElement.style.setProperty('--secondary', `${secondaryHSL.h} ${secondaryHSL.s}% ${secondaryHSL.l}%`);
    document.documentElement.style.setProperty('--secondary-foreground', '210 40% 98%');
    
    document.documentElement.style.setProperty('--accent', `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`);
    document.documentElement.style.setProperty('--accent-foreground', '210 40% 98%');
    
    // Update monify-specific direct color variables (for components that use these directly)
    document.documentElement.style.setProperty('--monify-purple-600', settings.primaryColor);
    document.documentElement.style.setProperty('--monify-pink-600', settings.secondaryColor);
    document.documentElement.style.setProperty('--monify-cyan-500', settings.accentColor);
    
    // Update sidebar colors
    document.documentElement.style.setProperty('--sidebar-background', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
    document.documentElement.style.setProperty('--sidebar-foreground', '210 40% 98%');
    document.documentElement.style.setProperty('--sidebar-primary', `${secondaryHSL.h} ${secondaryHSL.s}% ${secondaryHSL.l}%`);
    document.documentElement.style.setProperty('--sidebar-primary-foreground', '210 40% 98%');
    document.documentElement.style.setProperty('--sidebar-accent', `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`);
    document.documentElement.style.setProperty('--sidebar-accent-foreground', '210 40% 98%');
    document.documentElement.style.setProperty('--sidebar-border', `${primaryHSL.h} 80% 40%`);
    document.documentElement.style.setProperty('--sidebar-ring', `${primaryHSL.h} 90% 51%`);
    
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
    
    // Add persistent style for sidebar text visibility
    const existingSidebarStyle = document.getElementById('sidebar-visibility-fix');
    if (existingSidebarStyle) {
      existingSidebarStyle.remove();
    }
    
    const sidebarStyle = document.createElement('style');
    sidebarStyle.id = 'sidebar-visibility-fix';
    sidebarStyle.textContent = `
      [data-sidebar="sidebar"] {
        background-color: ${settings.primaryColor} !important;
      }
      [data-sidebar="menu-button"] {
        color: white !important;
      }
      [data-sidebar="menu-item"] [data-sidebar="menu-button"]:hover {
        background-color: rgba(255, 255, 255, 0.2) !important;
        color: white !important;
      }
      [data-sidebar="menu-item"] [data-sidebar="menu-button"][data-active="true"] {
        background-color: rgba(255, 255, 255, 0.2) !important;
        color: white !important;
      }
      [data-sidebar="group-label"] {
        color: rgba(255, 255, 255, 0.8) !important;
      }
    `;
    document.head.appendChild(sidebarStyle);
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
