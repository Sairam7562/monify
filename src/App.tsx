
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BrandingProvider } from "./contexts/BrandingContext";
import { AuthProvider } from "./providers/AuthProvider";
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
import AdminAccessPage from "./pages/AdminAccessPage";
import RouteGuard from "./components/auth/RouteGuard";
import AdminRedirect from "./components/auth/AdminRedirect";
import Index from "./pages/Index";
import VerifyEmailPage from "./pages/VerifyEmailPage";

// Add print styles to handle printing financial statements
import "./styles/print.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrandingProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<LoginPage />} />
              <Route path="/index" element={<Index />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/admin-check" element={<AdminRedirect />} />
              <Route path="/admin-access" element={<AdminAccessPage />} />
              <Route path="/404" element={<NotFound />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <RouteGuard>
                  <Dashboard />
                </RouteGuard>
              } />
              <Route path="/personal-info" element={
                <RouteGuard>
                  <PersonalInfoPage />
                </RouteGuard>
              } />
              <Route path="/assets-liabilities" element={
                <RouteGuard>
                  <AssetsLiabilitiesPage />
                </RouteGuard>
              } />
              <Route path="/income-expenses" element={
                <RouteGuard>
                  <IncomeExpensesPage />
                </RouteGuard>
              } />
              <Route path="/business-dashboard" element={
                <RouteGuard>
                  <BusinessDashboardPage />
                </RouteGuard>
              } />
              <Route path="/financial-statements" element={
                <RouteGuard>
                  <FinancialStatementsPage />
                </RouteGuard>
              } />
              <Route path="/ai-advisor" element={
                <RouteGuard>
                  <AIAdvisorPage />
                </RouteGuard>
              } />
              <Route path="/settings" element={
                <RouteGuard>
                  <SettingsPage />
                </RouteGuard>
              } />
              <Route path="/admin" element={
                <RouteGuard requireAdmin={true}>
                  <MasterAdminPage />
                </RouteGuard>
              } />
              
              {/* Catch-all route - must be last */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </BrandingProvider>
  </QueryClientProvider>
);

export default App;
