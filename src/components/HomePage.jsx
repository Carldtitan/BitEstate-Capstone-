import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  DatabaseZap,
  FileSearch,
  Fingerprint,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import HelpTooltip from "./HelpTooltip";

const steps = [
  {
    number: "01",
    title: "Verify",
    text: "Upload the file you received and compare its SHA256 fingerprint with a trusted reference.",
    link: "/verify",
  },
  {
    number: "02",
    title: "Source",
    text: "A registry user signs in, unlocks the write path, and stores the trusted source hash.",
    link: "/source-truth",
  },
  {
    number: "03",
    title: "Receipt",
    text: "Every match or mismatch creates a receipt that shows what was checked and when.",
    link: "/verify",
  },
];

const controls = [
  {
    icon: FileSearch,
    badge: "Hash check",
    title: "Compare the file",
    text:
      "BitEstate reads the uploaded file in the browser and turns it into a SHA256 fingerprint. If the fingerprint equals the trusted source hash, the file has not changed.",
  },
  {
    icon: DatabaseZap,
    badge: "Source write",
    title: "Register the source",
    text:
      "An approved account uses the Source page to save the official document hash. The demo writes that hash to Sepolia and keeps the source details in the browser.",
  },
  {
    icon: ReceiptText,
    badge: "Receipt log",
    title: "Keep the proof",
    text:
      "A receipt records the candidate hash, source title, result, reviewer, and time. It gives the demo an audit trail without exposing the original document.",
  },
];

const entryCards = [
  {
    icon: ShieldCheck,
    label: "For reviewers",
    title: "Check a document you were given",
    text: "Start here when you need to confirm a file matches a trusted title, deed, or closing document.",
    cta: "Open verifier",
    to: "/verify",
  },
  {
    icon: LockKeyhole,
    label: "For registry users",
    title: "Create the trusted reference",
    text: "Use this path only when the source document is final and ready to become the comparison point.",
    cta: "Open registry",
    to: "/source-truth",
  },
];

export default function HomePage() {
  useEffect(() => {
    document.title = "BitEstate | Home";
  }, []);

  return (
    <div className="layout section home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="badge">Live document registry</p>
          <h1>Verify files against trusted source records.</h1>
          <p>
            BitEstate turns real estate documents into secure fingerprints, checks them against
            registered source hashes, and creates receipts for every review.
          </p>
          <div className="home-tags" aria-label="Platform tags">
            <span className="pill">
              <Fingerprint size={14} aria-hidden="true" />
              SHA256
            </span>
            <span className="pill">Sepolia</span>
            <span className="pill">Audit receipts</span>
          </div>
        </div>

        <div className="hero-panel">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">Choose a path</p>
              <h2>Start with the job you need to finish</h2>
            </div>
            <HelpTooltip>Verifier is for checking a file. Registry is for creating the trusted source.</HelpTooltip>
          </div>
          <div className="entry-grid">
            {entryCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.title} to={card.to} className="entry-card">
                  <span className="entry-icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <p className="eyebrow">{card.label}</p>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <span className="entry-cta">
                    {card.cta}
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="module-card flow-module">
        <div className="card-title-row">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>How a document moves through BitEstate</h2>
          </div>
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
      </section>

      <section className="home-feature-grid" aria-label="Core controls">
        {controls.map((control) => {
          const Icon = control.icon;
          return (
            <article key={control.title} className="module-card home-feature-card">
              <div className="card-title-row card-title-row-left">
                <span className="feature-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <p className="eyebrow">{control.badge}</p>
              </div>
              <h3>{control.title}</h3>
              <p>{control.text}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
