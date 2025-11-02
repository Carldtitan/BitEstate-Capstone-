import React, { useState } from "react";
import LoginPage from "./components/LoginPage";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import VerifyPage from "./components/VerifyPage";
import ListingsPage from "./components/ListingsPage";
import ListPropertyPage from "./components/ListPropertyPage";

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  const handleLogin = (username, password) => {
    if (username && password) {
      setUser({ username });
      setPage("home");
    } else {
      alert("Please enter both username and password");
    }
  };

  const renderPage = () => {
    if (!user) return <LoginPage onLogin={handleLogin} />;

    switch (page) {
      case "home":
        return <HomePage onNav={setPage} />;
      case "verify":
        return <VerifyPage />;
      case "listings":
        return <ListingsPage />;
      case "list-property":
        return <ListPropertyPage />;
      default:
        return <HomePage onNav={setPage} />;
    }
  };

  return (
    <div>
      {user && <Navbar onNav={setPage} />}
      {renderPage()}
    </div>
  );
}
