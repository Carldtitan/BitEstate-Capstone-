import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CowrieLogo from "./CowrieeLogo";

export default function Navbar() {
  const { user, login, logout, isAdmin } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <Link className="brand" to="/" onClick={closeMenu}>
          <CowrieLogo size={36} />
          BitEstate
        </Link>

        <div className="nav-right">
          {user ? (
            <div className="nav-chip" title={user.email || user.displayName || "Signed in"}>
              {isAdmin ? "Admin" : "Signed in"}
            </div>
          ) : !isLoginPage ? (
            <button className="btn-primary btn" onClick={login}>
              Sign in with Google
            </button>
          ) : null}

          {user ? (
            <button className="btn" onClick={() => setMenuOpen((open) => !open)}>
              {user.displayName?.split(" ")[0] || "Menu"}
            </button>
          ) : (
            <button className="btn" onClick={() => setMenuOpen((open) => !open)}>
              Menu
            </button>
          )}

          <button className="hamburger" onClick={() => setMenuOpen((open) => !open)} title="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <>
          <div className="navbar-menu">
            <Link to="/" className="menu-item" onClick={closeMenu}>
              Home
            </Link>
            <Link to="/verify" className="menu-item" onClick={closeMenu}>
              Verify document
            </Link>
            <Link to="/register" className="menu-item" onClick={closeMenu}>
              Register trusted reference
            </Link>
            <Link to="/audit-trail" className="menu-item" onClick={closeMenu}>
              Audit trail
            </Link>
            <Link to="/marketplace" className="menu-item" onClick={closeMenu}>
              Marketplace coming soon
            </Link>
            {isAdmin && (
              <Link to="/register" className="menu-item admin" onClick={closeMenu}>
                Admin reference vault
              </Link>
            )}
            <div className="menu-divider"></div>
            {!user && !isLoginPage && (
              <button
                className="menu-item"
                onClick={() => {
                  login();
                  closeMenu();
                }}
              >
                Sign in with Google
              </button>
            )}
            {user && (
              <button
                className="menu-item logout"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                Log out
              </button>
            )}
          </div>
          <div className="navbar-overlay" onClick={closeMenu}></div>
        </>
      )}
    </>
  );
}
