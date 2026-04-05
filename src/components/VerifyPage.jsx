import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { verifyHash } from "../contract.js";
import { generateHash } from "../hash";
import { copyToClipboard } from "../utils/clipboard";
import { buildRecordHash } from "../utils/recordHash";
import {
  listTrustedReferences,
  listVerificationLogs,
  saveVerificationLog,
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
        setStatus("Could not load sources.");
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
      setStatus("Register a source first.");
      return;
    }
    if (!candidateFile) {
      setStatus("Choose a file.");
      return;
    }

    setStatus("Hashing file...");
    setChainStatus("");
    setReceipt(null);

    try {
      const nextCandidateHash = await generateHash(candidateFile);
      const match = nextCandidateHash === selectedReference.fileHash;
      const onChain = selectedReference.onChainTxHash ? true : await verifyHash(selectedReference.fileHash);
      const verifiedByName = user?.displayName || user?.email || "Guest";
      const receiptHash = buildRecordHash(nextCandidateHash, {
        title: selectedReference.documentTitle,
        documentType: selectedReference.documentType,
        jurisdiction: selectedReference.jurisdiction,
        fileName: candidateFile.name,
        sourceId: selectedReference.id,
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
      setStatus(match ? "Match." : "No match.");
      setChainStatus(
        onChain === null
          ? "Chain check unavailable."
          : onChain
          ? "On-chain."
          : "Not on-chain."
      );
      setLogs((prev) => [logEntry, ...prev.filter((entry) => entry.id !== logEntry.id)].slice(0, 8));
    } catch (error) {
      console.error(error);
      setStatus(error?.message || "Verification failed.");
    }
  };

  return (
    <div className="layout section">
      <div className="section-header">
        <div>
          <p className="badge">Verify</p>
          <h2 style={{ margin: 0 }}>Check a file</h2>
          <p className="muted" style={{ marginTop: "8px" }}>
            SHA256 match + Sepolia check.
          </p>
        </div>
        <Link className="btn" to="/source-truth">
          Register source
        </Link>
      </div>

      {!references.length && (
        <div className="status" style={{ marginBottom: "16px" }}>
          No sources yet.{" "}
          <Link className="inline-link" to="/source-truth">
            Register one now.
          </Link>
        </div>
      )}

      <div className="verify-grid">
        <section className="form-card">
          <h3 style={{ marginTop: 0 }}>Source</h3>
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

          {selectedReference ? (
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
                Registered {formatStamp(selectedReference.createdAt)}
              </p>
            </div>
          ) : (
            <div className="empty-state" style={{ marginTop: "16px" }}>
              Add a source first.
            </div>
          )}
        </section>

        <section className="form-card">
          <h3 style={{ marginTop: 0 }}>File</h3>
          <label className="muted">Document to check</label>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="input"
            onChange={(e) => setCandidateFile(e.target.files[0] || null)}
          />
          <button className="btn-primary btn" style={{ marginTop: "16px" }} onClick={handleVerify}>
            Check file
          </button>
          {status && <div className="status" style={{ marginTop: "12px" }}>{status}</div>}
          {chainStatus && <div className="status" style={{ marginTop: "8px" }}>{chainStatus}</div>}
          {receipt && (
            <div className="receipt-panel" style={{ marginTop: "16px" }}>
              <div className="receipt-top">
                <div>
                  <h4 style={{ margin: 0 }}>Receipt</h4>
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
                  <div>{receipt.verifiedByName || "Guest"}</div>
                </div>
                <div>
                  <span className="label">Reference</span>
                  <div>{receipt.referenceTitle || "Untitled"}</div>
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
                    () => setStatus("Copy failed.")
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
            <h3 style={{ margin: 0 }}>Recent checks</h3>
            <p className="muted" style={{ marginTop: "8px" }}>
              Last few receipts created in the demo.
            </p>
          </div>
        </div>
        <div className="stack">
          {logs.length ? (
            logs.map((log) => (
              <article key={log.id} className="receipt-card">
                <div className="receipt-top">
                  <div>
                    <h4 style={{ margin: 0 }}>{log.referenceTitle || "Untitled"}</h4>
                    <p className="muted" style={{ margin: "4px 0 0" }}>
                      {log.documentType || "Document"} | {log.jurisdiction || "Unknown"}
                    </p>
                  </div>
                  <span className={`badge ${log.match ? "badge-good" : "badge-warn"}`}>
                    {log.match ? "Matched" : "Mismatch"}
                  </span>
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {log.candidateFileName || "Uploaded file"}
                </p>
                <p className="muted" style={{ margin: 0 }}>
                  {log.verifiedByName || "Guest"} | {formatStamp(log.createdAt)}
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
            <div className="empty-state">No checks yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
