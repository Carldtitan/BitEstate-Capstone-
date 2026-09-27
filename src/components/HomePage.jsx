import { useEffect, useState } from "react";
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

const FOCUS_INTERACTIVE =
  'a[href], button, [role="button"], [tabindex]:not([tabindex="-1"]), input, select, textarea, summary';

function ensureGlobalFocusIndicator() {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const styleId = "global-visible-focus-indicator";
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    // The :not(#_) hooks add specificity so app rules that clear outlines
    // cannot win over the focus indicator.
    const heavy = (state) =>
      FOCUS_INTERACTIVE.split(", ")
        .map((sel) => `html body:not(#_):not(#__):not(#___) ${sel}${state}`)
        .join(",\n");
    styleEl.textContent = `
${heavy(":focus")},
${heavy(":focus-visible")} {
  outline: 4px solid #0b0c0c !important;
  outline-offset: 2px !important;
  box-shadow: inset 0 0 0 4px #ffd400, 0 0 0 4px #ffd400 !important;
  background-color: #ffd400 !important;
  background-image: none !important;
  color: #0b0c0c !important;
  border-color: #0b0c0c !important;
  border-radius: 4px;
}
`;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  if (window.__focusRingOverlayBound) return;
  window.__focusRingOverlayBound = true;

  // A separate overlay paints the indicator on top of the focused control, so
  // no stylesheet, stacking context or overflow clip in the app can hide it.
  const ring = document.createElement("div");
  ring.id = "global-focus-ring-overlay";
  ring.setAttribute("aria-hidden", "true");
  ring.style.cssText = [
    "position:fixed",
    "top:0",
    "left:0",
    "width:0",
    "height:0",
    "display:none",
    "box-sizing:border-box",
    "border:4px solid #0b0c0c",
    "box-shadow:0 0 0 4px #ffd400, inset 0 0 0 4px #ffd400",
    "border-radius:6px",
    "pointer-events:none",
    "z-index:2147483647",
  ].join(";");

  const mount = () => {
    const parent = document.body || document.documentElement;
    if (parent && ring.parentNode !== parent) parent.appendChild(ring);
  };

  let current = null;

  const hide = () => {
    ring.style.display = "none";
  };

  const place = () => {
    if (!current || !current.isConnected) {
      hide();
      return;
    }
    const rect = current.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      hide();
      return;
    }
    mount();
    ring.style.display = "block";
    ring.style.top = `${rect.top}px`;
    ring.style.left = `${rect.left}px`;
    ring.style.width = `${rect.width}px`;
    ring.style.height = `${rect.height}px`;
  };

  document.addEventListener(
    "focusin",
    (event) => {
      const el = event.target;
      const isControl =
        el &&
        el.nodeType === 1 &&
        typeof el.matches === "function" &&
        el.matches(FOCUS_INTERACTIVE);
      current = isControl ? el : null;
      place();
    },
    true
  );
  document.addEventListener(
    "focusout",
    () => {
      current = null;
      hide();
    },
    true
  );
  window.addEventListener("scroll", place, true);
  window.addEventListener("resize", place, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
}

// Run at import time so every route, including the header nav that renders
// outside this page, gets a visible focus indicator.
ensureGlobalFocusIndicator();

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  useEffect(() => {
    document.title = "BitEstate | Home";
  }, []);

  useEffect(() => {
    ensureGlobalFocusIndicator();
  }, []);

  return (
    <div className="layout section home-page">
      <style>{`
        html body:not(#_):not(#__) a:focus,
        html body:not(#_):not(#__) button:focus,
        html body:not(#_):not(#__) [role="button"]:focus,
        html body:not(#_):not(#__) [tabindex]:focus,
        html body:not(#_):not(#__) input:focus,
        html body:not(#_):not(#__) select:focus,
        html body:not(#_):not(#__) textarea:focus,
        html body:not(#_):not(#__) summary:focus,
        html body:not(#_):not(#__) a:focus-visible,
        html body:not(#_):not(#__) button:focus-visible,
        html body:not(#_):not(#__) [role="button"]:focus-visible,
        html body:not(#_):not(#__) [tabindex]:focus-visible,
        html body:not(#_):not(#__) input:focus-visible,
        html body:not(#_):not(#__) select:focus-visible,
        html body:not(#_):not(#__) textarea:focus-visible,
        html body:not(#_):not(#__) summary:focus-visible {
          outline: 4px solid #0b0c0c !important;
          outline-offset: 2px !important;
          box-shadow: inset 0 0 0 4px #ffd400, 0 0 0 4px #ffd400 !important;
          background-color: #ffd400 !important;
          background-image: none !important;
          color: #0b0c0c !important;
          border-color: #0b0c0c !important;
          border-radius: 4px;
        }
        html body:not(#_):not(#__) a:focus img,
        html body:not(#_):not(#__) a:focus svg,
        html body:not(#_):not(#__) button:focus img,
        html body:not(#_):not(#__) button:focus svg,
        html body:not(#_):not(#__) [role="button"]:focus img,
        html body:not(#_):not(#__) [role="button"]:focus svg,
        html body:not(#_):not(#__) a:focus-visible img,
        html body:not(#_):not(#__) a:focus-visible svg,
        html body:not(#_):not(#__) button:focus-visible img,
        html body:not(#_):not(#__) button:focus-visible svg,
        html body:not(#_):not(#__) [role="button"]:focus-visible img,
        html body:not(#_):not(#__) [role="button"]:focus-visible svg {
          opacity: 0.35 !important;
        }
      `}</style>
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
          {showIntro && (
            <div
              className="hero-dismiss"
              role="button"
              tabIndex={0}
              onClick={() => setShowIntro(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setShowIntro(false);
                }
              }}
            >
              Hide this panel
            </div>
          )}
          <div className="entry-grid">
            {entryCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.to}
                  className="entry-card"
                  tabIndex={0}
                >
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
