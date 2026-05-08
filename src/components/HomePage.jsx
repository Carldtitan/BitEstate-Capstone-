import { useEffect } from "react";
import { Link } from "react-router-dom";
import HelpTooltip from "./HelpTooltip";

const steps = [
  {
    number: "01",
    title: "Verify",
    text: "Upload a document and compare its SHA256 hash to a saved source.",
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
    text: "Each check creates a local receipt for the demo audit trail.",
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
    <div className="layout section home-page">
      <section className="page-header">
        <div>
          <p className="badge">Live demo</p>
          <div className="title-row">
            <h1>BitEstate</h1>
            <HelpTooltip>
              Verify uploaded documents against trusted source hashes, then keep a receipt.
            </HelpTooltip>
          </div>
        </div>
        <div className="page-actions">
          <Link to="/verify" className="btn-primary btn">
            Verify
          </Link>
          <Link to="/source-truth" className="btn">
            Source
          </Link>
        </div>
      </section>

      <section className="module-grid module-grid-primary">
        <div className="module-card module-card-hero">
          <p className="eyebrow">Document workflow</p>
          <h2>Register source hashes and verify files in one place.</h2>
          <div className="home-tags">
            <span className="pill">SHA256</span>
            <span className="pill">Sepolia</span>
            <span className="pill">Receipts</span>
          </div>
        </div>

        <div className="module-card">
          <div className="card-title-row">
            <h2>Flow</h2>
            <HelpTooltip>Use Verify for checks. Use Source when an approved account writes a trusted hash.</HelpTooltip>
          </div>
          <div className="home-step-list">
            {steps.map((step) => (
              <Link key={step.title} to={step.link} className="home-step">
                <span>{step.number}</span>
                <div>
                  <strong>{step.title}</strong>
                  <small>{step.text}</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-feature-grid">
        {controls.map((control) => (
          <div key={control.title} className="module-card home-feature-card">
            <div className="card-title-row">
              <p className="eyebrow">{control.badge}</p>
              <HelpTooltip>{control.text}</HelpTooltip>
            </div>
            <h3>{control.title}</h3>
          </div>
        ))}
      </section>
    </div>
  );
}
