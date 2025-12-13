import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";

export default function Navbar() {
  const { user, login, logout, isAdmin } = useAuth();
  const { balance, ethBalance, walletAddress, connectWallet, networkOk, walletError } = useWallet();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const shortAddress =
    walletAddress && walletAddress.length > 8
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : walletAddress;

  return (
    <nav className="navbar">
      <Link className="brand" to="/">
        <span className="brand-badge">B</span>
        BitEstate
      </Link>
      <div className="nav-links">
        <NavLink className="btn" to="/verify">
          Verify
        </NavLink>
        <NavLink className="btn" to="/listings">
          Listings
        </NavLink>
        <NavLink className="btn" to="/list-property">
          List Property
        </NavLink>
        {user && (
          <NavLink className="btn" to="/my-properties">
            My Properties
          </NavLink>
        )}
        {isAdmin && (
          <NavLink className="btn" to="/upload">
            Upload
          </NavLink>
        )}
        {user && walletAddress && (
          <>
            <span className="pill">ETH: {ethBalance}</span>
            <span className="pill">Cowries: {balance.toLocaleString()}</span>
          </>
        )}
        {user &&
          (walletError ? (
            <>
              <a
                className="btn"
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                title={walletError}
              >
                Install MetaMask
              </a>
              <span className="pill" style={{ color: "#f87171" }}>{walletError}</span>
            </>
          ) : (
            <button className="btn" onClick={connectWallet} title="">
              {shortAddress
                ? networkOk
                  ? shortAddress
                  : "Wrong network"
                : "Connect Wallet"}
            </button>
          ))}
        {user ? (
          <button className="btn" onClick={logout}>
            Logout
          </button>
        ) : !isLoginPage ? (
          <button className="btn-primary btn" onClick={login}>
            Login with Google
          </button>
        ) : null}
      </div>
    </nav>
  );
}
