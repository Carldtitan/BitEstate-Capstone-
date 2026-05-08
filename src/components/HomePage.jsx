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
    text: "Upload the document you received.",
    link: "/verify",
  },
  {
    number: "02",
    title: "Source",
    text: "Compare it with a registered source hash.",
    link: "/source-truth",
  },
  {
    number: "03",
    title: "Receipt",
    text: "Save the match or mismatch receipt.",
    link: "/verify",
  },
];

const controls = [
  {
    icon: FileSearch,
    badge: "Hash check",
    title: "Hash check",
    text:
      "BitEstate creates a SHA256 fingerprint from the file. The same file gives the same hash. Any edit gives a different hash.",
  },
  {
    icon: DatabaseZap,
    badge: "Source write",
    title: "Source write",
    text:
      "A registry user saves the official document hash to Sepolia. That source becomes the record other files are checked against.",
  },
  {
    icon: ReceiptText,
    badge: "Receipt log",
    title: "Receipt log",
    text:
      "Each check records the source, candidate hash, result, reviewer, and time. Use it as proof of what was checked.",
  },
];

const entryCards = [
  {
    icon: ShieldCheck,
    label: "For reviewers",
    title: "Verify a file",
    text: "Use this when someone sends you a deed, title file, or closing document.",
    cta: "Check file",
    to: "/verify",
    image: "/brand/real-estate-documents.jpg",
  },
  {
    icon: LockKeyhole,
    label: "For registry users",
    title: "Register a source",
    text: "Use this when the official document is final and ready to become the trusted record.",
    cta: "Register source",
    to: "/source-truth",
    image: "/brand/modern-home.jpg",
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
          <div className="hero-content">
            <p className="badge">Document verification</p>
            <h1>Check if a real estate file is authentic.</h1>
            <p>
              Upload a file. BitEstate compares its hash with a registered source and gives you a receipt.
            </p>
            <div className="home-tags" aria-label="Platform tags">
              <span className="pill">
                <Fingerprint size={14} aria-hidden="true" />
                SHA256
              </span>
              <span className="pill">Sepolia</span>
              <span className="pill">Receipts</span>
            </div>
          </div>
          <div className="hero-image-card">
            <img
              src="/brand/real-estate-documents.jpg"
              alt="Real estate documents and keys on a desk"
            />
            <div className="hero-image-caption">
              <strong>File never needs to be read manually.</strong>
              <span>The check is based on the document hash.</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">Start here</p>
              <h2>Choose the correct task</h2>
            </div>
            <HelpTooltip>Use Verify for checking a file. Use Source only for creating the trusted record.</HelpTooltip>
          </div>
          <div className="entry-grid">
            {entryCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.title} to={card.to} className="entry-card">
                  <img src={card.image} alt="" className="entry-card-image" />
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
            <h2>Simple flow</h2>
          </div>
          <HelpTooltip>The original file stays with the user. The app compares hashes and stores receipts.</HelpTooltip>
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
