
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BrandingProvider } from "./contexts/BrandingContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PersonalInfoPage from "./pages/PersonalInfoPage";
import AssetsLiabilitiesPage from "./pages/AssetsLiabilitiesPage";
import IncomeExpensesPage from "./pages/IncomeExpensesPage";
import BusinessDashboardPage from "./pages/BusinessDashboardPage";
import AIAdvisorPage from "./pages/AIAdvisorPage";
import FinancialStatementsPage from "./pages/FinancialStatementsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import MasterAdminPage from "./pages/MasterAdminPage";

// Add print styles to handle printing financial statements
import "./styles/print.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrandingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/personal-info" element={<PersonalInfoPage />} />
            <Route path="/assets-liabilities" element={<AssetsLiabilitiesPage />} />
            <Route path="/income-expenses" element={<IncomeExpensesPage />} />
            <Route path="/business-dashboard" element={<BusinessDashboardPage />} />
            <Route path="/financial-statements" element={<FinancialStatementsPage />} />
            <Route path="/ai-advisor" element={<AIAdvisorPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<MasterAdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </BrandingProvider>
  </QueryClientProvider>
);

export default App;
