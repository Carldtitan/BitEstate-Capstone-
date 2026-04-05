import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import VerifyPage from "./components/VerifyPage";
import ComingSoonPage from "./components/ComingSoonPage";
import UploadPage from "./components/UploadPage";
import LoginPage from "./components/LoginPage";
import AuditTrailPage from "./components/AuditTrailPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="layout">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminProtected({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="layout">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WalletProvider>
          <div className="page-shell">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/verify"
                element={
                  <Protected>
                    <VerifyPage />
                  </Protected>
                }
              />
              <Route
                path="/audit-trail"
                element={
                  <Protected>
                    <AuditTrailPage />
                  </Protected>
                }
              />
              <Route
                path="/register"
                element={
                  <AdminProtected>
                    <UploadPage />
                  </AdminProtected>
                }
              />
              <Route path="/upload" element={<Navigate to="/register" replace />} />
              <Route path="/listings" element={<ComingSoonPage />} />
              <Route path="/marketplace" element={<ComingSoonPage />} />
              <Route path="/list-property" element={<Navigate to="/register" replace />} />
              <Route path="/my-properties" element={<Navigate to="/audit-trail" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
          </div>
        </WalletProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
