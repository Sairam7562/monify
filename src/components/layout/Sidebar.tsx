
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

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

const SidebarItem = ({ icon, label, href, isActive }: SidebarItemProps) => (
  <Link
    to={href}
    className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
      isActive
        ? 'bg-monify-purple-500 text-white'
        : 'text-gray-200 hover:bg-monify-purple-700 hover:text-white'
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

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
    <aside className="fixed inset-y-0 left-0 z-20 flex h-full w-64 flex-col bg-sidebar border-r border-r-sidebar-border">
      <div className="flex h-16 items-center border-b border-b-sidebar-border px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">Monify</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname === item.href}
            />
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-t-sidebar-border p-4">
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
    </aside>
  );
};

export default Sidebar;
