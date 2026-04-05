import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { copyToClipboard } from "../utils/clipboard";
import { listTrustedReferences, listVerificationLogs } from "../services/bitestateStore";

function shortHash(value) {
  if (!value) return "-";
  return value.length > 14 ? `${value.slice(0, 10)}...${value.slice(-6)}` : value;
}

function formatStamp(value) {
  if (!value) return "Unknown";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function AuditTrailPage() {
  const [references, setReferences] = useState([]);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [nextReferences, nextLogs] = await Promise.all([
          listTrustedReferences(),
          listVerificationLogs({ limit: 20 }),
        ]);
        setReferences(nextReferences);
        setLogs(nextLogs);
      } catch (error) {
        console.warn("Failed to load audit trail", error);
        setStatus("Audit trail could not be loaded.");
      }
    };
    load();
  }, []);

  const stats = useMemo(
    () => [
      { label: "Trusted references", value: references.length },
      { label: "Verification receipts", value: logs.length },
      { label: "Latest action", value: logs[0] ? formatStamp(logs[0].createdAt) : "None yet" },
    ],
    [references.length, logs]
  );

  return (
    <div className="layout section">
      <div className="section-header">
        <div>
          <p className="badge">Audit trail</p>
          <h2 style={{ margin: 0 }}>Who verified what, and when</h2>
          <p className="muted" style={{ marginTop: "8px" }}>
            This is the proof layer that supports the business plan. It records trusted reference
            hashes, verification outcomes, and the user who performed the check.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link className="btn" to="/verify">
            Verify now
          </Link>
          <Link className="btn-primary btn" to="/register">
            Register reference
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((item) => (
          <div key={item.label} className="stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      {status && <div className="status" style={{ marginTop: "16px" }}>{status}</div>}

      <div className="audit-layout">
        <section className="audit-panel">
          <div className="section-header">
            <div>
              <h3 style={{ margin: 0 }}>Recent verification receipts</h3>
              <p className="muted">Each entry logs the reference, candidate file, result, and operator.</p>
            </div>
          </div>
          <div className="stack">
            {logs.length ? (
              logs.map((log) => (
                <article key={log.id} className="receipt-card">
                  <div className="receipt-top">
                    <div>
                      <h4 style={{ margin: 0 }}>{log.referenceTitle || "Untitled reference"}</h4>
                      <p className="muted" style={{ margin: "4px 0 0" }}>
                        {log.documentType || "Document"} | {log.jurisdiction || "Unknown jurisdiction"}
                      </p>
                    </div>
                    <span className={`badge ${log.match ? "badge-good" : "badge-warn"}`}>
                      {log.match ? "Matched" : "Mismatch"}
                    </span>
                  </div>
                  <p className="muted" style={{ margin: 0 }}>
                    Candidate: {log.candidateFileName || "Uploaded file"}
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
                  <button
                    className="btn"
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        log.receiptHash || "",
                        () => {
                          setCopied(log.id);
                          setTimeout(() => setCopied(""), 2000);
                        },
                        () => setStatus("Failed to copy receipt hash.")
                      )
                    }
                  >
                    {copied === log.id ? "Copied" : "Copy receipt"}
                  </button>
                </article>
              ))
            ) : (
              <div className="empty-state">No verification receipts yet.</div>
            )}
          </div>
        </section>

        <section className="audit-panel">
          <div className="section-header">
            <div>
              <h3 style={{ margin: 0 }}>Trusted references</h3>
              <p className="muted">The current controlled set of registered source files.</p>
            </div>
          </div>
          <div className="stack">
            {references.length ? (
              references.map((reference) => (
                <article key={reference.id} className="reference-card">
                  <div className="receipt-top">
                    <div>
                      <h4 style={{ margin: 0 }}>{reference.documentTitle || "Untitled reference"}</h4>
                      <p className="muted" style={{ margin: "4px 0 0" }}>
                        {reference.documentType || "Document"} | {reference.jurisdiction || "California"}
                      </p>
                    </div>
                    <span className={`badge ${reference.onChainTxHash ? "badge-good" : "badge-muted"}`}>
                      {reference.onChainTxHash ? "On-chain" : "Pending"}
                    </span>
                  </div>
                  <p className="muted" style={{ margin: 0 }}>
                    Uploaded by {reference.uploadedByName || "Unknown"} on {formatStamp(reference.createdAt)}
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
                </article>
              ))
            ) : (
              <div className="empty-state">
                No trusted references yet.{" "}
                <Link to="/register" className="inline-link">
                  Register the first one.
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
