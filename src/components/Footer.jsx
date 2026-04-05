import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="layout">
        <div className="footer-grid footer-grid-slim">
          <div className="footer-section">
            <div className="footer-brand">
              <span className="footer-badge">B</span>
              <h3>BitEstate</h3>
            </div>
            <p>
              Document verification for title and settlement teams. The marketplace stays in the
              codebase, but the current release focuses on trusted references and audit receipts.
            </p>
          </div>

          <div className="footer-section">
            <h4>Product</h4>
            <ul className="footer-links">
              <li><Link to="/verify">Verify document</Link></li>
              <li><Link to="/register">Register reference</Link></li>
              <li><Link to="/audit-trail">Audit trail</Link></li>
              <li><Link to="/marketplace">Marketplace coming soon</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Scope</h4>
            <ul className="footer-links">
              <li><span>California-first pilot</span></li>
              <li><span>Trusted source registration</span></li>
              <li><span>Proof receipts</span></li>
              <li><span>Version tracking</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} BitEstate. All rights reserved.</p>
          <p className="footer-tagline">Built for document integrity, not marketplace hype.</p>
        </div>
      </div>
    </footer>
  );
}
