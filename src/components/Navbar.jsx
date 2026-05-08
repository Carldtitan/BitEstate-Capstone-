import { Link, NavLink } from "react-router-dom";
import { FileCheck2, Home, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/verify", label: "Verify", icon: ShieldCheck },
  { to: "/source-truth", label: "Source", icon: FileCheck2 },
];

function NavItem({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      end={item.end}
      to={item.to}
      className={({ isActive }) => `tab-link${isActive ? " active" : ""}`}
      title={item.label}
    >
      <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="sidebar" aria-label="Dashboard">
      <Link className="brand" to="/">
        <span className="brand-mark" aria-hidden="true">
          <FileCheck2 size={21} strokeWidth={2.35} />
        </span>
        <span className="brand-copy">
          <strong>BitEstate</strong>
          <small>Verification registry</small>
        </span>
      </Link>

      <div className="sidebar-label">Dashboard</div>
      <div className="navbar-tabs">
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <span className="nav-chip" title={user.email || user.displayName || "Signed in"}>
              Account
            </span>
            <button className="btn" onClick={logout}>
              <LogOut aria-hidden="true" size={16} />
              Sign out
            </button>
          </>
        ) : (
          <button className="btn-primary btn" onClick={login}>
            <LogIn aria-hidden="true" size={16} />
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
