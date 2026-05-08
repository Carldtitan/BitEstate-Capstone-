import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Database, FileUp, ReceiptText, ShieldCheck } from "lucide-react";
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
import HelpTooltip from "./HelpTooltip";

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

function TaskHeader({ icon: Icon, step, title, text }) {
  return (
    <div className="task-card-header">
      <span className="task-icon" aria-hidden="true">
        <Icon size={19} />
      </span>
      <div>
        <span className="step-label">{step}</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
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

  const runVerification = async (reference, file) => {
    if (!reference) {
      setStatus("Register a source first.");
      return;
    }
    if (!file) {
      setStatus("Choose a file.");
      return;
    }

    setStatus("Hashing file...");
    setChainStatus("");
    setReceipt(null);

    try {
      const nextCandidateHash = await generateHash(file);
      const match = nextCandidateHash === reference.fileHash;
      const onChain =
        reference.onChainRegistered === false
          ? false
          : reference.onChainTxHash
          ? true
          : await verifyHash(reference.fileHash);
      const verifiedByName = user?.displayName || user?.email || "Guest";
      const receiptHash = buildRecordHash(nextCandidateHash, {
        title: reference.documentTitle,
        documentType: reference.documentType,
        jurisdiction: reference.jurisdiction,
        fileName: file.name,
        sourceId: reference.id,
        verifiedBy: verifiedByName,
        result: match ? "match" : "mismatch",
      });

      const logEntry = await saveVerificationLog({
        referenceId: reference.id,
        referenceTitle: reference.documentTitle,
        referenceHash: reference.fileHash,
        documentType: reference.documentType,
        jurisdiction: reference.jurisdiction,
        candidateFileName: file.name,
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
          ? "Source is on-chain."
          : "Database source checked."
      );
      setLogs((prev) => [logEntry, ...prev.filter((entry) => entry.id !== logEntry.id)].slice(0, 8));
    } catch (error) {
      console.error(error);
      setStatus(error?.message || "Verification failed.");
    }
  };

  const handleVerify = async () => {
    await runVerification(selectedReference, candidateFile);
  };

  return (
    <div className="layout section">
      <div className="section-header page-intro">
        <div>
          <p className="badge">Verify</p>
          <div className="title-row">
            <h1>Verify document</h1>
            <HelpTooltip>The file stays in your browser. BitEstate compares hashes, not document contents.</HelpTooltip>
          </div>
          <p className="page-note">Choose the trusted source, upload the file you received, then save the result.</p>
        </div>
        <Link className="btn page-action" to="/source-truth">
          Register source
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="verify-grid task-grid">
        <section className="form-card task-card">
          <TaskHeader
            icon={Database}
            step="Step 1"
            title="Select the trusted source"
            text="This is the official hash the uploaded file will be compared against."
          />
          <div className="field-group">
            <label className="field-label" htmlFor="reference-source">Source record</label>
            <select
              id="reference-source"
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
          </div>

          {selectedReference ? (
            <div className="reference-summary">
              <div className="receipt-top">
                <div>
                  <h4>{selectedReference.documentTitle}</h4>
                  <p className="muted">
                    {selectedReference.documentType} | {selectedReference.jurisdiction}
                  </p>
                </div>
                <span className={`badge ${selectedReference.onChainTxHash ? "badge-good" : "badge-muted"}`}>
                  {selectedReference.onChainTxHash ? "On-chain" : "Database"}
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
              <p className="muted">Registered {formatStamp(selectedReference.createdAt)}</p>
            </div>
          ) : (
            <div className="empty-state">Add a source first.</div>
          )}
        </section>

        <section className="form-card task-card">
          <TaskHeader
            icon={FileUp}
            step="Step 2"
            title="Upload the file to check"
            text="PDF, JPG, and PNG files are supported. The document itself is not uploaded to a server."
          />
          <div className="field-group">
            <label className="field-label" htmlFor="candidate-file">Document file</label>
            <input
              id="candidate-file"
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="input"
              onChange={(e) => setCandidateFile(e.target.files[0] || null)}
            />
          </div>
          {candidateFile && <p className="helper-line">Ready to check: {candidateFile.name}</p>}
          <div className="form-actions">
            <button className="btn-primary btn" onClick={handleVerify}>
              Check file
            </button>
          </div>
          {status && <div className="status status-strong">{status}</div>}
          {chainStatus && <div className="status">{chainStatus}</div>}
          {receipt && (
            <div className="receipt-panel">
              <div className="receipt-top">
                <div>
                  <h4>Verification receipt</h4>
                  <p className="muted">
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

      <section className="record-section">
        <div className="section-header compact-header">
          <div className="card-title-row card-title-row-left">
            <ReceiptText size={20} aria-hidden="true" />
            <h3>Recent checks</h3>
            <HelpTooltip>Verification receipts are saved to Firebase.</HelpTooltip>
          </div>
        </div>
        <div className="record-list">
          {logs.length ? (
            logs.map((log) => (
              <article key={log.id} className="record-card">
                <div className="record-card-main">
                  <div>
                    <h4>{log.referenceTitle || "Untitled"}</h4>
                    <p>{log.candidateFileName || "Uploaded file"}</p>
                  </div>
                  <span className={`badge ${log.match ? "badge-good" : "badge-warn"}`}>
                    {log.match ? "Matched" : "Mismatch"}
                  </span>
                </div>
                <div className="record-meta">
                  <span>
                    <Clock3 size={14} aria-hidden="true" />
                    {formatStamp(log.createdAt)}
                  </span>
                  <span>
                    <ShieldCheck size={14} aria-hidden="true" />
                    {shortHash(log.receiptHash)}
                  </span>
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
