import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import VerifyPage from "./components/VerifyPage";
import ListingsPage from "./components/ListingsPage";
import ListPropertyPage from "./components/ListPropertyPage";
import UploadPage from "./components/UploadPage";
import LoginPage from "./components/LoginPage";
import MyPropertiesPage from "./components/MyPropertiesPage";
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
                path="/listings"
                element={
                  <Protected>
                    <ListingsPage />
                  </Protected>
                }
              />
              <Route
                path="/list-property"
                element={
                  <Protected>
                    <ListPropertyPage />
                  </Protected>
                }
              />
              <Route
                path="/my-properties"
                element={
                  <Protected>
                    <MyPropertiesPage />
                  </Protected>
                }
              />
              <Route
                path="/upload"
                element={
                  <AdminProtected>
                    <UploadPage />
                  </AdminProtected>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </WalletProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
