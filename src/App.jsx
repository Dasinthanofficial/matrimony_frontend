import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import PublicLayout from "./layouts/PublicLayout";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import AgencyPendingPage from "./pages/AgencyPendingPage";

import DashboardPage from "./pages/DashboardPage";
import SearchPage from "./pages/SearchPage";
import InterestsPage from "./pages/InterestsPage";
import ShortlistPage from "./pages/ShortlistPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";

import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";

// Agency Pages
import AgencyDashboardPage from "./pages/agency/AgencyDashboardPage";
import AgencyProfilesPage from "./pages/agency/AgencyProfilesPage";
import AgencyPaymentsPage from "./pages/agency/AgencyPaymentsPage";
import AgencyVerifiedBadgePage from "./pages/agency/AgencyVerifiedBadgePage";


import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AgencyRoute from "./components/AgencyRoute";
import { Icons } from "./components/Icons";

import MyOrdersPage from "./pages/orders/MyOrdersPage";
import AgencyPublicServicesPage from "./pages/agency/AgencyPublicServicesPage";

import VisitorsPage from "./pages/VisitorsPage";

/* SUBPAGES */
const PrivacyPage = () => (
  <div className="min-h-screen pt-28 pb-16 page-container">
    <h1 className="heading-lg mb-4">Privacy Policy</h1>
    <p className="text-[var(--text-secondary)]">Privacy policy content goes here.</p>
  </div>
);

const TermsPage = () => (
  <div className="min-h-screen pt-28 pb-16 page-container">
    <h1 className="heading-lg mb-4">Terms of Service</h1>
    <p className="text-[var(--text-secondary)]">Terms of service content goes here.</p>
  </div>
);

/* ERROR BOUNDARY */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Icons.AlertTriangle size={28} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-[var(--text-muted)] mb-6 text-sm">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="btn-primary">
                <Icons.RefreshCw size={16} />
                <span>Refresh Page</span>
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
                className="btn-secondary"
              >
                <Icons.Home size={16} />
                <span>Go Home</span>
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-6 text-left text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-4 overflow-auto max-h-40">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* APP WITH DYNAMIC VH FIX */
function App() {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <ErrorBoundary>
      <>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/agency/pending" element={<AgencyPendingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/agency/:agencyId/services" element={<AgencyPublicServicesPage />} />
            <Route path="/payment/cancel" element={<PaymentCancelPage />} />
          </Route>

          {/* ==================== AUTH ROUTES ==================== */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          </Route>

          {/* ==================== PROTECTED ROUTES ==================== */}
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/visitors"
              element={
                <ProtectedRoute>
                  <VisitorsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agency"
              element={
                <AgencyRoute>
                  <AgencyDashboardPage />
                </AgencyRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agency/profiles"
              element={
                <AgencyRoute>
                  <AgencyProfilesPage />
                </AgencyRoute>
              }
            />
            <Route
              path="/agency/payments"
              element={
                <AgencyRoute>
                  <AgencyPaymentsPage />
                </AgencyRoute>
              }
            />

            <Route
              path="/payment/success"
              element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/interests"
              element={
                <ProtectedRoute>
                  <InterestsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shortlist"
              element={
                <ProtectedRoute>
                  <ShortlistPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />


            <Route
              path="/agency/verified-badge"
              element={
                <AgencyRoute>
                  <AgencyVerifiedBadgePage />
                </AgencyRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/subscription/success"
              element={
                <ProtectedRoute>
                  <SubscriptionSuccessPage />
                </ProtectedRoute>
              }
            />

            <Route path="/my-profile" element={<Navigate to="/profile/me" replace />} />

            <Route path="/chat">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="with/:participantId"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":conversationId"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="/profile">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="me"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":profileId"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <CompleteProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    </ErrorBoundary>
  );
}

export default App;