import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await login();
    } catch (err) {
      console.error("Login error:", err);
      const msg = err?.message || err?.code || String(err);
      if (msg.includes("popup-closed")) {
        setError("Sign-in was canceled.");
      } else if (msg.includes("network")) {
        setError("Network error. Check your connection and try again.");
      } else if (msg.includes("auth")) {
        setError("Authentication failed. Please check your Google account.");
      } else {
        setError(`Sign-in failed: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout" style={{ padding: "120px 0" }}>
      <div className="form-card" style={{ maxWidth: "520px" }}>
        <h2 style={{ margin: "0 0 10px" }}>Sign in to BitEstate</h2>
        <p className="muted">
          Use your Google account. If Firebase is not configured, this will fall back to a local demo
          session.
        </p>
        {error && (
          <div className="error" style={{ marginTop: "12px", padding: "10px 12px" }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button
            className="btn-primary btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </button>
          <Link className="btn" to="/">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
