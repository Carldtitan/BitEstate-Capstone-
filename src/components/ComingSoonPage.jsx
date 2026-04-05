import { Link } from "react-router-dom";

export default function ComingSoonPage() {
  return (
    <div className="layout section">
      <div className="form-card coming-soon-card">
        <p className="badge">Marketplace</p>
        <h2 style={{ marginTop: 0 }}>Coming Soon</h2>
        <p className="muted" style={{ marginBottom: "18px" }}>
          The marketplace is intentionally paused while the product focuses on trusted document
          registration, verification receipts, and the audit trail described in the business plan.
        </p>

        <div className="scope-grid">
          <div className="mini-panel">
            <h4 style={{ marginTop: 0 }}>Live now</h4>
            <p className="muted">
              Google sign-in, trusted reference registration, document verification, and proof
              receipts.
            </p>
          </div>
          <div className="mini-panel">
            <h4 style={{ marginTop: 0 }}>Coming next</h4>
            <p className="muted">
              Buyer and seller workflows return after the pilot validates the narrower title and
              settlement use case.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "18px" }}>
          <Link to="/verify" className="btn-primary btn">
            Verify a document
          </Link>
          <Link to="/register" className="btn">
            Register trusted reference
          </Link>
        </div>
      </div>
    </div>
  );
}
