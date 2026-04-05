import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CowrieLogo from "./CowrieeLogo";

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link className="brand" to="/">
        <CowrieLogo size={36} />
        <span>BitEstate</span>
      </Link>

      <div className="navbar-tabs">
        <NavLink end to="/" className={({ isActive }) => `tab-link${isActive ? " active" : ""}`}>
          Home
        </NavLink>
        <NavLink to="/verify" className={({ isActive }) => `tab-link${isActive ? " active" : ""}`}>
          Verify
        </NavLink>
        <NavLink
          to="/source-truth"
          className={({ isActive }) => `tab-link${isActive ? " active" : ""}`}
        >
          Source
        </NavLink>
        <NavLink
          to="/marketplace"
          className={({ isActive }) => `tab-link tab-link-locked${isActive ? " active" : ""}`}
          title="Locked preview"
        >
          Marketplace
        </NavLink>
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <span className="nav-chip" title={user.email || user.displayName || "Signed in"}>
              {user.displayName || "Signed in"}
            </span>
            <button className="btn" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <button className="btn-primary btn" onClick={login}>
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
