import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import CowrieLogo from "./CowrieLogo";

export default function Navbar() {
  const { user, login, logout, isAdmin } = useAuth();
  const { balance, ethBalance, walletAddress, connectWallet, networkOk, walletError } = useWallet();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const [menuOpen, setMenuOpen] = useState(false);

  const shortAddress =
    walletAddress && walletAddress.length > 8
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : walletAddress;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <Link className="brand" to="/" onClick={closeMenu}>
          <CowrieLogo size={36} />
          BitEstate
        </Link>

        {/* Center - could add search here in future */}
        <div style={{ flex: 1 }}></div>

        {/* Right side - essentials only */}
        <div className="nav-right">
          {/* Wallet Widget */}
          {user && walletAddress && (
            <div className="wallet-widget">
              <button
                className="btn"
                title={walletError || (networkOk ? "Connected" : "Wrong network")}
              >
                {networkOk ? "💰" : "⚠️"} {shortAddress}
              </button>
              <div className="wallet-balances">
                <span title="Ethereum balance">Ξ {ethBalance}</span>
                <span title="Cowries balance">◎ {balance.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Connect Wallet */}
          {user && !walletAddress && (
            <button className="btn" onClick={connectWallet} title="Connect MetaMask">
              Connect Wallet
            </button>
          )}

          {/* User Menu / Login */}
          {user ? (
            <button className="btn user-btn" onClick={() => setMenuOpen(!menuOpen)}>
              👤 {user.displayName?.split(" ")[0] || "User"}
            </button>
          ) : !isLoginPage ? (
            <button className="btn-primary btn" onClick={login}>
              Sign in
            </button>
          ) : null}

          {/* Hamburger Menu */}
          <button className="hamburger" onClick={toggleMenu} title="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="navbar-menu">
          <Link to="/verify" className="menu-item" onClick={closeMenu}>
            ✓ Verify Document
          </Link>
          <Link to="/listings" className="menu-item" onClick={closeMenu}>
            🏠 Browse Listings
          </Link>
          <Link to="/list-property" className="menu-item" onClick={closeMenu}>
            ➕ List Property
          </Link>
          {user && (
            <Link to="/my-properties" className="menu-item" onClick={closeMenu}>
              📋 My Properties
            </Link>
          )}
          {isAdmin && (
            <Link to="/upload" className="menu-item admin" onClick={closeMenu}>
              ⬆️ Upload (Admin)
            </Link>
          )}
          
          <div className="menu-divider"></div>

          {walletError && (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noreferrer"
              className="menu-item"
              onClick={closeMenu}
            >
              📦 Install MetaMask
            </a>
          )}

          {!networkOk && user && (
            <div className="menu-item" style={{ color: "#f87171", cursor: "default" }}>
              ⚠️ Wrong network (need Sepolia)
            </div>
          )}

          <div className="menu-divider"></div>

          {user && (
            <button
              className="menu-item logout"
              onClick={() => {
                logout();
                closeMenu();
              }}
            >
              🚪 Logout
            </button>
          )}
        </div>
      )}

      {/* Overlay for menu */}
      {menuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
    </>
  );
}
