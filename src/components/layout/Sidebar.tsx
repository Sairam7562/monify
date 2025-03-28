
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  CircleDollarSign,
  ChartBar,
  FileText,
  PieChart,
  MessageSquare,
  Settings,
  HelpCircle,
  User,
} from 'lucide-react';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

const SidebarItem = ({ icon, label, href, isActive }: SidebarItemProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={label}
        isActive={isActive}
        asChild
      >
        <Link to={href} className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { state } = useSidebar();

  const sidebarItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: <User className="h-5 w-5" />,
      label: 'Personal Info',
      href: '/personal-info',
    },
    {
      icon: <CircleDollarSign className="h-5 w-5" />,
      label: 'Assets & Liabilities',
      href: '/assets-liabilities',
    },
    {
      icon: <ChartBar className="h-5 w-5" />,
      label: 'Income & Expenses',
      href: '/income-expenses',
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'Financial Statements',
      href: '/financial-statements',
    },
    {
      icon: <PieChart className="h-5 w-5" />,
      label: 'Business Dashboard',
      href: '/business-dashboard',
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'AI Advisor',
      href: '/ai-advisor',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      href: '/settings',
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: 'Help & Support',
      href: '/help',
    },
  ];

  return (
    <SidebarComponent
      className="bg-sidebar"
      collapsible={state === "collapsed" ? "icon" : "offcanvas"}
    >
      <SidebarRail />
      <div className="flex h-16 items-center px-4 border-b border-b-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <span className={cn("text-xl font-bold text-white transition-opacity", 
            state === "collapsed" ? "opacity-0" : "opacity-100")}>
            Monify
          </span>
        </Link>
      </div>
      <SidebarContent className="py-4">
        <SidebarMenu>
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname === item.href}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <div className={cn("mt-auto border-t border-t-sidebar-border p-4 transition-opacity", 
          state === "collapsed" ? "opacity-0" : "opacity-100")}>
        <div className="rounded-lg bg-monify-pink-600 p-4 text-sm text-white">
          <p className="mb-2 font-medium">Need help?</p>
          <p className="mb-4 text-xs text-white/80">
            Our friendly support team is here to make your financial journey fun and easy!
          </p>
          <Link
            to="/contact"
            className="block w-full rounded-md bg-white px-4 py-2 text-center text-xs font-medium text-monify-pink-600 hover:bg-gray-100"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </SidebarComponent>
  );
};

export default Sidebar;
