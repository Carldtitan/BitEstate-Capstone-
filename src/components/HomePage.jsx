import { useEffect } from "react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Verify",
    text: "Upload a document and compare it to the stored hash.",
    link: "/verify",
  },
  {
    number: "02",
    title: "Source",
    text: "Approved users unlock the write path and save the source on Sepolia.",
    link: "/source-truth",
  },
  {
    number: "03",
    title: "Receipt",
    text: "Each check keeps a record you can review later.",
    link: "/verify",
  },
];

const controls = [
  {
    badge: "Hash check",
    title: "Compare first",
    text: "Drop in a file and match the SHA256 before anything else.",
  },
  {
    badge: "Source write",
    title: "Write on Sepolia",
    text: "Only approved users can open the form and store the source.",
  },
  {
    badge: "Receipt log",
    title: "Keep proof",
    text: "Every action leaves a record you can review later.",
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
          <h1 className="home-title">Verify files. Register sources.</h1>
          <p className="home-subtitle">
            Upload a document to compare hashes. Approved users can write the source on Sepolia
            and keep a receipt.
          </p>
          <div className="home-actions">
            <Link to="/verify" className="btn-primary btn">
              Verify file
            </Link>
            <Link to="/source-truth" className="btn">
              Register source
            </Link>
          </div>
          <div className="home-tags">
            <span className="pill">SHA256</span>
            <span className="pill">Sepolia</span>
            <span className="pill">Device code</span>
          </div>
        </div>

        <div className="home-preview">
          <div className="home-preview-card">
            <p className="badge">How it works</p>
            <div className="home-step-list">
              {steps.map((step) => (
                <Link key={step.title} to={step.link} className="home-step">
                  <span>{step.number}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 style={{ margin: 0 }}>Core controls</h2>
            <p className="muted" style={{ marginTop: "8px" }}>
              The demo keeps three things live.
            </p>
          </div>
        </div>

        <div className="home-feature-grid">
          {controls.map((control) => (
            <div key={control.title} className="home-feature-card">
              <p className="badge">{control.badge}</p>
              <h3>{control.title}</h3>
              <p>{control.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
