import { useEffect } from "react";
import { Link } from "react-router-dom";

const steps = [
  {
    title: "Check a file",
    text: "Upload a document and compare it against a trusted hash.",
    link: "/verify",
  },
  {
    title: "Lock a source",
    text: "Registry users unlock the write path, then store the source on Sepolia.",
    link: "/source-truth",
  },
  {
    title: "Preview the marketplace",
    text: "It stays visible, blurred, and disabled.",
    link: "/marketplace",
  },
];

export default function HomePage() {
  useEffect(() => {
    document.title = "BitEstate | Home";
  }, []);

  return (
    <div className="layout home-page">
      <section className="home-hero">
        <div className="home-copy">
          <p className="badge">Live demo</p>
          <h1 className="home-title">Verify documents. Lock sources. Park the marketplace.</h1>
          <p className="home-subtitle">
            BitEstate keeps the demo simple: check a file, upload a source, and leave the
            marketplace as a preview.
          </p>
          <div className="home-actions">
            <Link to="/verify" className="btn-primary btn">
              Start verify
            </Link>
            <Link to="/source-truth" className="btn">
              Open source upload
            </Link>
            <Link to="/marketplace" className="btn">
              View marketplace
            </Link>
          </div>
          <div className="home-tags">
            <span className="pill">SHA256</span>
            <span className="pill">Sepolia</span>
            <span className="pill">Registry code</span>
          </div>
        </div>

        <div className="home-preview">
          <div className="home-preview-card">
            <p className="badge">What is live</p>
            <div className="home-step-list">
              <div className="home-step">
                <span>01</span>
                <div>
                  <strong>Verify</strong>
                  <p>Match a file to a trusted source.</p>
                </div>
              </div>
              <div className="home-step">
                <span>02</span>
                <div>
                  <strong>Source</strong>
                  <p>Unlock, connect, and write the source hash.</p>
                </div>
              </div>
              <div className="home-step">
                <span>03</span>
                <div>
                  <strong>Marketplace</strong>
                  <p>Visible, but turned off.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="home-mini-grid">
            {steps.map((step) => (
              <Link key={step.title} to={step.link} className="home-mini-card">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 style={{ margin: 0 }}>Use the tabs above</h2>
            <p className="muted" style={{ marginTop: "8px" }}>
              Start on Home, then use the tabs.
            </p>
          </div>
        </div>

        <div className="home-feature-grid">
          <div className="home-feature-card">
            <p className="badge">Verification</p>
            <h3>SHA256 match</h3>
            <p>
              Upload a file, compare its hash, and write the receipt for the check.
            </p>
          </div>
          <div className="home-feature-card">
            <p className="badge">Source</p>
            <h3>Registry lock</h3>
            <p>
              The write path stays behind the device code and the connected wallet.
            </p>
          </div>
          <div className="home-feature-card">
            <p className="badge">Marketplace</p>
            <h3>Preview only</h3>
            <p>
              You can see it, but you cannot use it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
