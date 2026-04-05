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
              Live demo for SHA256 checks, Sepolia writes, and approved source uploads.
            </p>
          </div>

          <div className="footer-section">
            <h4>Tabs</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/verify">Verify</Link></li>
              <li><Link to="/source-truth">Source</Link></li>
              <li><Link to="/preview">Preview</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} BitEstate. All rights reserved.</p>
          <p className="footer-tagline">SHA256, Sepolia, and receipts.</p>
        </div>
      </div>
    </footer>
  );
}
