
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface NavbarProps {
  showSidebarToggle?: boolean;
}

const Navbar = ({ showSidebarToggle = true }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for admin role when user data changes
    if (user) {
      // Check role in a case-insensitive way
      const adminRole = 
        user && 
        typeof user.role === 'string' && 
        user.role.toLowerCase() === 'admin';
      
      console.log('User role check:', user.role, 'isAdmin:', adminRole);
      setIsAdmin(adminRole);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

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

  const handleAdminDashboard = () => {
    navigate('/admin-check');
    setIsMobileMenuOpen(false);
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
                <Button 
                  variant="outline" 
                  onClick={handleAdminDashboard} 
                  className="flex items-center gap-2 border-2 border-monify-purple-500 text-monify-purple-700 hover:bg-monify-purple-100"
                >
                  <ShieldCheck className="h-4 w-4" />
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
              <Link to="/dashboard" className="hover:text-monify-purple-500 transition-colors block py-2" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/personal-info" className="hover:text-monify-purple-500 transition-colors block py-2" onClick={() => setIsMobileMenuOpen(false)}>Personal Info</Link>
              <Link to="/assets-liabilities" className="hover:text-monify-purple-500 transition-colors block py-2" onClick={() => setIsMobileMenuOpen(false)}>Assets/Liabilities</Link>
              <Link to="/income-expenses" className="hover:text-monify-purple-500 transition-colors block py-2" onClick={() => setIsMobileMenuOpen(false)}>Income/Expenses</Link>
              <Link to="/financial-statements" className="hover:text-monify-purple-500 transition-colors block py-2" onClick={() => setIsMobileMenuOpen(false)}>Statements</Link>
              <Link to="/ai-advisor" className="hover:text-monify-purple-500 transition-colors block py-2" onClick={() => setIsMobileMenuOpen(false)}>AI Advisor</Link>
              <Link to="/settings" className="hover:text-monify-purple-500 transition-colors block py-2" onClick={() => setIsMobileMenuOpen(false)}>Settings</Link>
              
              {user && (
                <>
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      onClick={handleAdminDashboard} 
                      className="w-full flex items-center justify-center gap-2 border-2 border-monify-purple-500 text-monify-purple-700 hover:bg-monify-purple-100"
                    >
                      <ShieldCheck className="h-4 w-4" />
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
