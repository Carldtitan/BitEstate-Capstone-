import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  DatabaseZap,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import HelpTooltip from "./HelpTooltip";

const entryCards = [
  {
    icon: ShieldCheck,
    label: "For reviewers",
    title: "Verify a file",
    text: "Compare a received document with its trusted hash.",
    cta: "Check file",
    to: "/verify",
    image: "/brand/real-estate-documents.jpg",
  },
  {
    icon: LockKeyhole,
    label: "For registry users",
    title: "Register a source",
    text: "Save the official hash for future checks.",
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
            <h1>Verify real estate documents by hash.</h1>
            <p>
              Compare a received file with a trusted source and keep a receipt.
            </p>
            <div className="home-tags" aria-label="Platform tags">
              <span className="pill">
                <Fingerprint size={14} aria-hidden="true" />
                Hash check
              </span>
              <span className="pill">
                <DatabaseZap size={14} aria-hidden="true" />
                Firestore
              </span>
              <span className="pill">Receipt</span>
            </div>
          </div>
          <div className="hero-image-card">
            <img
              src="/brand/real-estate-documents.jpg"
              alt="Real estate documents and keys on a desk"
            />
            <div className="hero-image-caption">
              <strong>Private by design</strong>
              <span>Hashes are checked. Files are not stored.</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="card-title-row">
            <div>
              <p className="eyebrow">Start here</p>
              <h2>Choose the right path</h2>
            </div>
            <HelpTooltip>Verify checks a received file. Source creates the trusted record used for comparison.</HelpTooltip>
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
    </div>
  );
}
