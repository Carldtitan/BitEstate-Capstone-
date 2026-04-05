import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { generateHash } from "../hash";
import { verifyHash } from "../contract.js";
import { copyToClipboard } from "../utils/clipboard";
import { buildRecordHash } from "../utils/recordHash";
import {
  listTrustedReferences,
  listVerificationLogs,
  saveVerificationLog,
} from "../services/bitestateStore";
import { useAuth } from "../context/AuthContext";

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

export default function VerifyPage() {
  const { user } = useAuth();
  const [references, setReferences] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedReferenceId, setSelectedReferenceId] = useState("");
  const [candidateFile, setCandidateFile] = useState(null);
  const [status, setStatus] = useState("");
  const [chainStatus, setChainStatus] = useState("");
  const [candidateHash, setCandidateHash] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [nextReferences, nextLogs] = await Promise.all([
          listTrustedReferences(),
          listVerificationLogs({ limit: 8 }),
        ]);
        setReferences(nextReferences);
        setLogs(nextLogs);
      } catch (error) {
        console.warn("Failed to load references", error);
        setStatus("Trusted references could not be loaded.");
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedReferenceId && references[0]) {
      setSelectedReferenceId(references[0].id);
    }
  }, [references, selectedReferenceId]);

  const selectedReference = useMemo(
    () => references.find((reference) => reference.id === selectedReferenceId) || references[0] || null,
    [references, selectedReferenceId]
  );

  const handleVerify = async () => {
    if (!selectedReference) {
      setStatus("Register a trusted reference first.");
      return;
    }
    if (!candidateFile) {
      setStatus("Upload the document you want to verify.");
      return;
    }

    setStatus("Hashing document and checking against the trusted reference...");
    setChainStatus("");
    setReceipt(null);

    try {
      const nextCandidateHash = await generateHash(candidateFile);
      const match = nextCandidateHash === selectedReference.fileHash;
      const onChain = selectedReference.onChainTxHash ? true : await verifyHash(selectedReference.fileHash);
      const verifiedByName = user?.displayName || user?.email || "Signed-in user";
      const receiptHash = buildRecordHash(nextCandidateHash, {
        title: selectedReference.documentTitle,
        documentType: selectedReference.documentType,
        jurisdiction: selectedReference.jurisdiction,
        fileName: candidateFile.name,
        referenceId: selectedReference.id,
        verifiedBy: verifiedByName,
        result: match ? "match" : "mismatch",
      });
      const logEntry = await saveVerificationLog({
        referenceId: selectedReference.id,
        referenceTitle: selectedReference.documentTitle,
        referenceHash: selectedReference.fileHash,
        documentType: selectedReference.documentType,
        jurisdiction: selectedReference.jurisdiction,
        candidateFileName: candidateFile.name,
        candidateHash: nextCandidateHash,
        match,
        receiptHash,
        verifiedByName,
        verifiedByEmail: user?.email || "",
        verifiedByUid: user?.uid || "",
        onChainRegistered: onChain === null ? null : Boolean(onChain),
        createdAt: new Date().toISOString(),
        createdAtMs: Date.now(),
      });

      setCandidateHash(nextCandidateHash);
      setReceipt(logEntry);
      setStatus(match ? "Document matches the trusted reference." : "Document does not match the trusted reference.");
      if (onChain === null) {
        setChainStatus("On-chain check unavailable. The local receipt still records the verification.");
      } else if (onChain) {
        setChainStatus("Trusted reference found on-chain.");
      } else {
        setChainStatus("Trusted reference is not registered on-chain yet.");
      }
      setLogs((prev) => [logEntry, ...prev.filter((entry) => entry.id !== logEntry.id)].slice(0, 8));
    } catch (error) {
      console.error(error);
      setStatus(error?.message || "Failed to verify the document.");
    }
  };

  return (
    <div className="layout section">
      <div className="section-header">
        <div>
          <p className="badge">Verification</p>
          <h2 style={{ margin: 0 }}>Compare a document against a trusted reference</h2>
          <p className="muted" style={{ marginTop: "8px" }}>
            Upload the file you want to check, choose the trusted source version, and BitEstate
            will create a proof receipt for the result.
          </p>
        </div>
        <Link className="btn" to="/audit-trail">
          View audit trail
        </Link>
      </div>

      {!references.length && (
        <div className="status" style={{ marginBottom: "16px" }}>
          No trusted references exist yet.{" "}
          <Link className="inline-link" to="/register">
            Register one first.
          </Link>
        </div>
      )}

      <div className="verify-grid">
        <section className="form-card">
          <h3 style={{ marginTop: 0 }}>1. Select the trusted reference</h3>
          <select
            className="select"
            value={selectedReferenceId}
            onChange={(e) => setSelectedReferenceId(e.target.value)}
            disabled={!references.length}
          >
            {references.map((reference) => (
              <option key={reference.id} value={reference.id}>
                {reference.documentTitle} ({reference.documentType})
              </option>
            ))}
          </select>

          {selectedReference && (
            <div className="reference-summary">
              <div className="receipt-top">
                <div>
                  <h4 style={{ margin: 0 }}>{selectedReference.documentTitle}</h4>
                  <p className="muted" style={{ margin: "4px 0 0" }}>
                    {selectedReference.documentType} | {selectedReference.jurisdiction}
                  </p>
                </div>
                <span className={`badge ${selectedReference.onChainTxHash ? "badge-good" : "badge-muted"}`}>
                  {selectedReference.onChainTxHash ? "On-chain" : "Pending"}
                </span>
              </div>
              <div className="receipt-grid">
                <div>
                  <span className="label">File hash</span>
                  <div className="mono">{shortHash(selectedReference.fileHash)}</div>
                </div>
                <div>
                  <span className="label">Receipt hash</span>
                  <div className="mono">{shortHash(selectedReference.receiptHash)}</div>
                </div>
              </div>
              <p className="muted" style={{ marginBottom: 0 }}>
                Registered by {selectedReference.uploadedByName || "Unknown"} on{" "}
                {formatStamp(selectedReference.createdAt)}
              </p>
            </div>
          )}
        </section>

        <section className="form-card">
          <h3 style={{ marginTop: 0 }}>2. Upload the document to verify</h3>
          <label className="muted">Candidate file</label>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="input"
            onChange={(e) => setCandidateFile(e.target.files[0] || null)}
          />
          <button className="btn-primary btn" style={{ marginTop: "16px" }} onClick={handleVerify}>
            Generate verification receipt
          </button>
          {status && <div className="status" style={{ marginTop: "12px" }}>{status}</div>}
          {chainStatus && <div className="status" style={{ marginTop: "8px" }}>{chainStatus}</div>}
          {receipt && (
            <div className="receipt-panel" style={{ marginTop: "16px" }}>
              <div className="receipt-top">
                <div>
                  <h4 style={{ margin: 0 }}>Proof receipt</h4>
                  <p className="muted" style={{ margin: "4px 0 0" }}>
                    {receipt.match ? "Match" : "Mismatch"} | {formatStamp(receipt.createdAt)}
                  </p>
                </div>
                <span className={`badge ${receipt.match ? "badge-good" : "badge-warn"}`}>
                  {receipt.match ? "Matched" : "Mismatch"}
                </span>
              </div>
              <div className="receipt-grid">
                <div>
                  <span className="label">Candidate hash</span>
                  <div className="mono">{shortHash(candidateHash)}</div>
                </div>
                <div>
                  <span className="label">Receipt hash</span>
                  <div className="mono">{shortHash(receipt.receiptHash)}</div>
                </div>
              </div>
              <div className="receipt-grid">
                <div>
                  <span className="label">Verified by</span>
                  <div>{receipt.verifiedByName || "Unknown"}</div>
                </div>
                <div>
                  <span className="label">Reference</span>
                  <div>{receipt.referenceTitle || "Untitled reference"}</div>
                </div>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  copyToClipboard(
                    receipt.receiptHash || "",
                    () => {
                      setCopyFeedback("receipt");
                      setTimeout(() => setCopyFeedback(""), 2000);
                    },
                    () => setStatus("Failed to copy receipt hash.")
                  )
                }
              >
                {copyFeedback === "receipt" ? "Copied" : "Copy receipt hash"}
              </button>
            </div>
          )}
        </section>
      </div>

      <section className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="section-header">
          <div>
            <h3 style={{ margin: 0 }}>Recent verification activity</h3>
            <p className="muted">This is the audit trail that the plan says the product should keep.</p>
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
              </article>
            ))
          ) : (
            <div className="empty-state">No verification activity yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
