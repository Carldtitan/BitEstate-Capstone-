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
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";

function LoginGate({ children }) {
  const { loading } = useAuth();
  if (loading) return <div className="layout">Loading...</div>;
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
              <Route path="/home" element={<HomePage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/source-truth" element={<UploadPage />} />
              <Route path="/register" element={<Navigate to="/source-truth" replace />} />
              <Route path="/upload" element={<Navigate to="/source-truth" replace />} />
              <Route path="/audit-trail" element={<Navigate to="/verify" replace />} />
              <Route path="/listings" element={<Navigate to="/preview" replace />} />
              <Route path="/preview" element={<ComingSoonPage />} />
              <Route path="/marketplace" element={<Navigate to="/preview" replace />} />
              <Route path="/list-property" element={<Navigate to="/source-truth" replace />} />
              <Route path="/my-properties" element={<Navigate to="/verify" replace />} />
              <Route
                path="/login"
                element={
                  <LoginGate>
                    <LoginPage />
                  </LoginGate>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
          </div>
        </WalletProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
