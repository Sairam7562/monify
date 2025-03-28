
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface NavbarProps {
  showSidebarToggle?: boolean;
}

const Navbar = ({ showSidebarToggle = true }: NavbarProps) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'Admin';
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("You have been logged out successfully");
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="border-b">
      <nav className="mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-bold text-xl">
          Monify
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="hover:text-monify-purple-500 transition-colors">Dashboard</Link>
          <Link to="/personal-info" className="hover:text-monify-purple-500 transition-colors">Personal Info</Link>
          <Link to="/assets-liabilities" className="hover:text-monify-purple-500 transition-colors">Assets/Liabilities</Link>
          <Link to="/income-expenses" className="hover:text-monify-purple-500 transition-colors">Income/Expenses</Link>
          <Link to="/financial-statements" className="hover:text-monify-purple-500 transition-colors">Statements</Link>
          <Link to="/ai-advisor" className="hover:text-monify-purple-500 transition-colors">AI Advisor</Link>
          <Link to="/settings" className="hover:text-monify-purple-500 transition-colors">Settings</Link>
          
          {user && (
            <>
              {isAdmin && (
                <Button variant="outline" onClick={() => navigate('/admin-check')}>
                  Admin Dashboard
                </Button>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
          
          {!user && (
            <>
              <Link to="/login">
                <Button variant="outline">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button>
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden" onClick={toggleMobileMenu}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-64">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through the application.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Link to="/dashboard" className="hover:text-monify-purple-500 transition-colors block py-2">Dashboard</Link>
              <Link to="/personal-info" className="hover:text-monify-purple-500 transition-colors block py-2">Personal Info</Link>
              <Link to="/assets-liabilities" className="hover:text-monify-purple-500 transition-colors block py-2">Assets/Liabilities</Link>
              <Link to="/income-expenses" className="hover:text-monify-purple-500 transition-colors block py-2">Income/Expenses</Link>
              <Link to="/financial-statements" className="hover:text-monify-purple-500 transition-colors block py-2">Statements</Link>
              <Link to="/ai-advisor" className="hover:text-monify-purple-500 transition-colors block py-2">AI Advisor</Link>
              <Link to="/settings" className="hover:text-monify-purple-500 transition-colors block py-2">Settings</Link>
              
              {user && (
                <>
                  {isAdmin && (
                    <Button variant="outline" onClick={() => {navigate('/admin-check'); setIsMobileMenuOpen(false);}} className="w-full">
                      Admin Dashboard
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => {handleLogout(); setIsMobileMenuOpen(false);}} className="w-full">
                    Logout
                  </Button>
                </>
              )}
              
              {!user && (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Navbar;
