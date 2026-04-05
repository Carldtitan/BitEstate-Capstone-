import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listTrustedReferences,
  listVerificationLogs,
} from "../services/bitestateStore";

function shortHash(value) {
  if (!value) return "-";
  return value.length > 18 ? `${value.slice(0, 10)}...${value.slice(-6)}` : value;
}

function formatStamp(value) {
  if (!value) return "Unknown";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function HomePage() {
  const [references, setReferences] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    document.title = "BitEstate | Document verification for title and settlement teams";
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [nextReferences, nextLogs] = await Promise.all([
          listTrustedReferences({ limit: 4 }),
          listVerificationLogs({ limit: 4 }),
        ]);
        setReferences(nextReferences);
        setLogs(nextLogs);
      } catch (error) {
        console.warn("Failed to load home data", error);
      }
    };
    load();
  }, []);

  const heroStats = useMemo(
    () => [
      { label: "Trusted references", value: references.length.toString().padStart(2, "0") },
      { label: "Verification receipts", value: logs.length.toString().padStart(2, "0") },
      { label: "Initial market", value: "California" },
    ],
    [references.length, logs.length]
  );

  const workflow = [
    {
      title: "Register the trusted source",
      text: "An admin signs in, connects a wallet, and registers the source document hash on Sepolia.",
    },
    {
      title: "Compare the candidate file",
      text: "A signed-in user uploads the file they want to check and BitEstate compares it to the reference hash.",
    },
    {
      title: "Store the proof receipt",
      text: "The app writes who verified what, when, and whether it matched into the audit trail.",
    },
  ];

  const scopeCards = [
    {
      title: "What is live now",
      text: "Google sign-in, trusted reference registration, file verification, proof receipts, and audit logs.",
    },
    {
      title: "What is intentionally excluded",
      text: "BitEstate does not replace county recording, determine ownership, or run the transaction itself.",
    },
    {
      title: "Marketplace",
      text: "Buying and selling flows are preserved as a Coming Soon section while the pilot stays focused.",
      link: "/marketplace",
    },
  ];

  return (
    <div className="layout">
      <section className="hero">
        <div className="hero-card hero-copy">
          <p className="badge">Title and settlement workflow</p>
          <h1 className="hero-title">Document verification built for controlled closing files.</h1>
          <p className="hero-subtitle">
            BitEstate narrows the real estate problem down to one clear job: register a trusted
            source, verify a candidate document against that source, and preserve a proof receipt
            for the file operator.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/verify" className="btn-primary btn">
              Verify a document
            </Link>
            <Link to="/register" className="btn">
              Register trusted reference
            </Link>
            <Link to="/audit-trail" className="btn">
              Audit trail
            </Link>
          </div>
          <div className="stat-band">
            {heroStats.map((stat) => (
              <div className="stat" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-card hero-side">
          <div className="mini-panel">
            <p className="badge" style={{ marginBottom: "10px" }}>
              Current release
            </p>
            <h3 style={{ marginTop: 0 }}>A document-first product, not a marketplace demo.</h3>
            <p className="muted">
              The business plan now centers on California title and settlement operators, proof
              receipts, and an audit trail that can be reviewed later.
            </p>
          </div>
          <div className="workflow-list">
            <div className="workflow-step">
              <span>1</span>
              <div>
                <strong>Trusted reference</strong>
                <p>Registered by an admin on a controlled path.</p>
              </div>
            </div>
            <div className="workflow-step">
              <span>2</span>
              <div>
                <strong>Verification</strong>
                <p>Candidate file compared to the source hash.</p>
              </div>
            </div>
            <div className="workflow-step">
              <span>3</span>
              <div>
                <strong>Receipt</strong>
                <p>Who verified what, and when, is retained in the log.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 style={{ margin: 0 }}>How it works</h2>
            <p className="muted" style={{ marginTop: "8px" }}>
              The app now follows the same structure as the writeup.
            </p>
          </div>
        </div>
        <div className="grid">
          {workflow.map((item, index) => (
            <div key={item.title} className="card feature-card">
              <div className="feature-icon">{index + 1}</div>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 style={{ margin: 0 }}>Scope and positioning</h2>
            <p className="muted" style={{ marginTop: "8px" }}>
              The product is intentionally narrower than the original marketplace concept.
            </p>
          </div>
        </div>
        <div className="grid">
          {scopeCards.map((item) => (
            <div key={item.title} className="card">
              <div className="card-body">
                <p className="badge" style={{ width: "fit-content" }}>
                  {item.title}
                </p>
                <p className="muted" style={{ margin: 0 }}>
                  {item.text}
                </p>
                {item.link && (
                  <Link to={item.link} className="inline-link" style={{ marginTop: "6px" }}>
                    View the Coming Soon marketplace
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 style={{ margin: 0 }}>Recent proof receipts</h2>
            <p className="muted" style={{ marginTop: "8px" }}>
              Latest entries from the local audit log.
            </p>
          </div>
          <Link to="/audit-trail" className="btn">
            Open audit trail
          </Link>
        </div>
        <div className="grid">
          {logs.length ? (
            logs.map((log) => (
              <div key={log.id} className="card">
                <div className="card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <h4 style={{ margin: 0 }}>{log.referenceTitle || "Untitled reference"}</h4>
                    <span className={`badge ${log.match ? "badge-good" : "badge-warn"}`}>
                      {log.match ? "Match" : "Mismatch"}
                    </span>
                  </div>
                  <p className="muted" style={{ margin: 0 }}>
                    {log.documentType || "Document"} | {log.jurisdiction || "Unknown jurisdiction"}
                  </p>
                  <p className="muted" style={{ margin: 0 }}>
                    Verified by {log.verifiedByName || "Unknown"} on {formatStamp(log.createdAt)}
                  </p>
                  <div className="receipt-grid">
                    <div>
                      <span className="label">Candidate hash</span>
                      <div className="mono">{shortHash(log.candidateHash)}</div>
                    </div>
                    <div>
                      <span className="label">Receipt hash</span>
                      <div className="mono">{shortHash(log.receiptHash)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card">
              <div className="card-body">
                <h4 style={{ marginTop: 0 }}>No receipts yet</h4>
                <p className="muted" style={{ margin: 0 }}>
                  Register a trusted reference first, then verify a document to create the first
                  receipt.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 style={{ margin: 0 }}>Trusted references</h2>
            <p className="muted" style={{ marginTop: "8px" }}>
              Controlled source documents currently available for verification.
            </p>
          </div>
          <Link to="/register" className="btn-primary btn">
            Add reference
          </Link>
        </div>
        <div className="grid">
          {references.length ? (
            references.map((reference) => (
              <div key={reference.id} className="card">
                <div className="card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <h4 style={{ margin: 0 }}>{reference.documentTitle}</h4>
                    <span className={`badge ${reference.onChainTxHash ? "badge-good" : "badge-muted"}`}>
                      {reference.onChainTxHash ? "On-chain" : "Pending"}
                    </span>
                  </div>
                  <p className="muted" style={{ margin: 0 }}>
                    {reference.documentType} | {reference.jurisdiction}
                  </p>
                  <p className="muted" style={{ margin: 0 }}>
                    Registered on {formatStamp(reference.createdAt)}
                  </p>
                  <div className="receipt-grid">
                    <div>
                      <span className="label">File hash</span>
                      <div className="mono">{shortHash(reference.fileHash)}</div>
                    </div>
                    <div>
                      <span className="label">Receipt hash</span>
                      <div className="mono">{shortHash(reference.receiptHash)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card">
              <div className="card-body">
                <h4 style={{ marginTop: 0 }}>No trusted references yet</h4>
                <p className="muted" style={{ margin: 0 }}>
                  Use the admin registration page to add the first source document.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
