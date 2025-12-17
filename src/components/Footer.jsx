export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="layout">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <span className="footer-badge">◎</span>
              <h3>BitEstate</h3>
            </div>
            <p>Blockchain-verified property titles for secure real estate transactions.</p>
            <div className="social-links">
              <a href="#" title="Twitter" aria-label="Twitter">𝕏</a>
              <a href="#" title="GitHub" aria-label="GitHub">◊</a>
              <a href="#" title="Discord" aria-label="Discord">⬡</a>
            </div>
          </div>

          {/* Product Links */}
          <div className="footer-section">
            <h4>Product</h4>
            <ul className="footer-links">
              <li><a href="/">Browse Listings</a></li>
              <li><a href="/list-property">List Property</a></li>
              <li><a href="/verify">Verify Document</a></li>
              <li><a href="/my-properties">My Properties</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-section">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#disclaimer">Disclaimer</a></li>
              <li><a href="#contact">Support</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} BitEstate. All rights reserved.</p>
          <p className="footer-tagline">Powered by Ethereum • Built on Vercel</p>
        </div>
      </div>
    </footer>
  );
}
