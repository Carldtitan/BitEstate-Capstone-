import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="layout" style={{ padding: "120px 0" }}>
      <div className="form-card" style={{ maxWidth: "520px" }}>
        <h2 style={{ margin: "0 0 10px" }}>Sign in to BitEstate</h2>
        <p className="muted">
          Use your Google account. If Firebase is not configured, this will fall back to a local demo
          session.
        </p>
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button className="btn-primary btn" onClick={login}>
            Continue with Google
          </button>
          <Link className="btn" to="/">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
