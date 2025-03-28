
import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useBranding } from '@/contexts/BrandingContext';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const MainLayout = ({ children, showSidebar = true }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const { brandingSettings } = useBranding();
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        {showSidebar && !isMobile && <Sidebar />}
        
        <div className="flex flex-col flex-1">
          <Navbar showSidebarToggle={showSidebar} />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
          <footer className="p-4 text-center text-sm text-gray-500 border-t">
            {brandingSettings.footerText || `© ${new Date().getFullYear()} Monify. All rights reserved.`}
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
