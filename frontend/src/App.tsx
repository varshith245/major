import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ToastProvider } from './context/ToastContext';
import { SavedSchemesProvider } from './context/SavedSchemesContext';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { AssistantPage } from './pages/AssistantPage';
import { SchemeExplorerPage } from './pages/SchemeExplorerPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { EligibilityWizardPage } from './pages/EligibilityWizardPage';
import { EligibilityResultPage } from './pages/EligibilityResultPage';
import { DocumentChecklistPage } from './pages/DocumentChecklistPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { SavedSchemesPage } from './pages/SavedSchemesPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSchemesPage } from './pages/admin/AdminSchemesPage';
import { AdminEligibilityRulesPage } from './pages/admin/AdminEligibilityRulesPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';
import { AdminAiPage } from './pages/admin/AdminAiPage';
import { AdminRecommendationsPage } from './pages/admin/AdminRecommendationsPage';
import { AdminQueriesPage } from './pages/admin/AdminQueriesPage';
import { AdminLanguagesPage } from './pages/admin/AdminLanguagesPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="animate-spin w-8 h-8 border-2 border-govblue-800 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Only Route Guard Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="animate-spin w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Unified Admin Route + Layout Wrapper
const AdminRouteLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminRoute>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AdminRoute>
  );
};

// Citizen Dashboard Route Wrapper (Redirects Admins to Admin Dashboard)
const CitizenDashboardRoute: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <CitizenDashboardPage />;
};

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AccessibilityProvider>
          <ToastProvider>
            <AuthProvider>
              <SavedSchemesProvider>
                <AppShell>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/schemes" element={<SchemeExplorerPage />} />
                    <Route path="/schemes/:id" element={<SchemeDetailPage />} />
                    <Route path="/compare" element={<ComparisonPage />} />
                    <Route path="/documents" element={<DocumentChecklistPage />} />
                    <Route path="/verify-documents" element={<DocumentChecklistPage initialTab="verifier" />} />
                    <Route path="/assistant" element={<AssistantPage />} />
                    <Route path="/eligibility" element={<EligibilityWizardPage />} />
                    <Route path="/eligibility/result" element={<EligibilityResultPage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* Citizen Authenticated Routes */}
                    <Route
                      path="/onboarding"
                      element={
                        <ProtectedRoute>
                          <OnboardingPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <CitizenDashboardRoute />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/recommendations"
                      element={
                        <ProtectedRoute>
                          <RecommendationsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/saved"
                      element={
                        <ProtectedRoute>
                          <SavedSchemesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/applications"
                      element={
                        <ProtectedRoute>
                          <ApplicationsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Enterprise Management Routes */}
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin/dashboard" element={<AdminRouteLayout><AdminDashboardPage /></AdminRouteLayout>} />
                    <Route path="/admin/applications" element={<AdminRouteLayout><AdminApplicationsPage /></AdminRouteLayout>} />
                    <Route path="/admin/users" element={<AdminRouteLayout><AdminUsersPage /></AdminRouteLayout>} />
                    <Route path="/admin/schemes" element={<AdminRouteLayout><AdminSchemesPage /></AdminRouteLayout>} />
                    <Route path="/admin/eligibility-rules" element={<AdminRouteLayout><AdminEligibilityRulesPage /></AdminRouteLayout>} />
                    <Route path="/admin/documents" element={<AdminRouteLayout><AdminDocumentsPage /></AdminRouteLayout>} />
                    <Route path="/admin/ai" element={<AdminRouteLayout><AdminAiPage /></AdminRouteLayout>} />
                    <Route path="/admin/recommendations" element={<AdminRouteLayout><AdminRecommendationsPage /></AdminRouteLayout>} />
                    <Route path="/admin/queries" element={<AdminRouteLayout><AdminQueriesPage /></AdminRouteLayout>} />
                    <Route path="/admin/languages" element={<AdminRouteLayout><AdminLanguagesPage /></AdminRouteLayout>} />
                    <Route path="/admin/analytics" element={<AdminRouteLayout><AdminAnalyticsPage /></AdminRouteLayout>} />
                    <Route path="/admin/audit-logs" element={<AdminRouteLayout><AdminAuditLogsPage /></AdminRouteLayout>} />
                    <Route path="/admin/settings" element={<AdminRouteLayout><AdminSettingsPage /></AdminRouteLayout>} />
                    <Route path="/admin/profile" element={<AdminRouteLayout><AdminProfilePage /></AdminRouteLayout>} />

                    {/* Fallback Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppShell>
              </SavedSchemesProvider>
            </AuthProvider>
          </ToastProvider>
        </AccessibilityProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
