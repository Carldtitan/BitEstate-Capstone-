import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { generateHash } from "../hash";
import { logHash } from "../contract.js";
import { buildRecordHash } from "../utils/recordHash";
import { copyToClipboard } from "../utils/clipboard";
import { validators, sanitizeText } from "../utils/validation";
import {
  listTrustedReferences,
  saveTrustedReference,
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

export default function UploadPage() {
  const { user } = useAuth();
  const { walletAddress, connectWallet, networkOk, walletError } = useWallet();
  const [form, setForm] = useState({
    documentTitle: "",
    documentType: "Title Commitment",
    jurisdiction: "California",
    version: "1",
    notes: "",
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [fileHash, setFileHash] = useState("");
  const [receiptHash, setReceiptHash] = useState("");
  const [txHash, setTxHash] = useState("");
  const [savedReference, setSavedReference] = useState(null);
  const [references, setReferences] = useState([]);
  const [copyFeedback, setCopyFeedback] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const nextReferences = await listTrustedReferences();
        setReferences(nextReferences);
      } catch (error) {
        console.warn("Failed to load trusted references", error);
      }
    };
    load();
  }, []);

  const nextVersion = useMemo(() => {
    if (!references.length) return 1;
    const versions = references
      .filter((reference) => reference.documentTitle === form.documentTitle)
      .map((reference) => Number(reference.version) || 0);
    const highest = versions.length ? Math.max(...versions) : 0;
    return highest + 1;
  }, [references, form.documentTitle]);

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (validators.text(form.documentTitle, "Document title")) {
      nextErrors.documentTitle = validators.text(form.documentTitle, "Document title");
    }
    if (!form.documentType) {
      nextErrors.documentType = "Document type is required";
    }
    if (!form.jurisdiction) {
      nextErrors.jurisdiction = "Jurisdiction is required";
    }
    const fileError = validators.file(file, ["application/pdf", "image/jpeg", "image/png"], 10);
    if (fileError) {
      nextErrors.file = fileError;
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("Please fix the errors below before registering the reference.");
      return;
    }

    if (!user) {
      setStatus("Please sign in first.");
      return;
    }

    if (!walletAddress) {
      const address = await connectWallet();
      if (!address) {
        setStatus(walletError || "Wallet not found. Please install MetaMask.");
        return;
      }
    }

    if (!networkOk) {
      setStatus("Please switch your wallet to Sepolia (chainId 0xaa36a7).");
      return;
    }

    setStatus("Hashing the trusted reference and writing the receipt...");
    setTxHash("");
    setReceiptHash("");
    setFileHash("");
    setSavedReference(null);

    try {
      const nextFileHash = await generateHash(file);
      const nextReceiptHash = buildRecordHash(nextFileHash, {
        title: sanitizeText(form.documentTitle),
        documentType: sanitizeText(form.documentType),
        jurisdiction: sanitizeText(form.jurisdiction),
        fileName: file.name,
        version: form.version,
        notes: sanitizeText(form.notes),
        verifiedBy: user.displayName || user.email || "Signed-in user",
        result: "trusted-reference",
      });

      setFileHash(nextFileHash);
      setReceiptHash(nextReceiptHash);
      setStatus("Registering the hash on-chain...");
      const nextTxHash = await logHash(nextFileHash);
      setTxHash(nextTxHash);

      const reference = await saveTrustedReference({
        documentTitle: sanitizeText(form.documentTitle),
        documentType: sanitizeText(form.documentType),
        jurisdiction: sanitizeText(form.jurisdiction),
        version: Number(form.version) || nextVersion,
        notes: sanitizeText(form.notes),
        fileName: file.name,
        fileHash: nextFileHash,
        receiptHash: nextReceiptHash,
        onChainTxHash: nextTxHash,
        onChainRegistered: true,
        uploadedByUid: user.uid,
        uploadedByName: user.displayName || "Signed-in user",
        uploadedByEmail: user.email || "",
        createdAt: new Date().toISOString(),
        createdAtMs: Date.now(),
      });

      setSavedReference(reference);
      setReferences((prev) => [reference, ...prev.filter((item) => item.id !== reference.id)]);
      setStatus("Trusted reference registered. The receipt is ready for verification.");
    } catch (error) {
      console.error(error);
      setStatus(error?.message || "Failed to register the trusted reference.");
    }
  };

  return (
    <div className="layout section">
      <div className="section-header">
        <div>
          <p className="badge">Admin only</p>
          <h2 style={{ margin: 0 }}>Register a trusted reference</h2>
          <p className="muted" style={{ marginTop: "8px" }}>
            This replaces the old listing flow. The app now uses this route to register a source
            document, record its fingerprint, and keep the proof for later verification.
          </p>
        </div>
      </div>

      <div className="status" style={{ marginBottom: "16px" }}>
        <div>Signed in as {user?.displayName || user?.email || "Admin"}</div>
        <div className="muted" style={{ marginTop: "6px" }}>
          Wallet: {walletAddress ? shortHash(walletAddress) : "Not connected"} | Network:{" "}
          {networkOk ? "Sepolia ready" : "Switch to Sepolia"}
        </div>
        <div style={{ marginTop: "10px" }}>
          <button className="btn-primary btn" type="button" onClick={connectWallet}>
            {walletAddress ? "Reconnect wallet" : "Connect wallet"}
          </button>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <input
              className="input"
              placeholder="Document title *"
              value={form.documentTitle}
              onChange={setField("documentTitle")}
            />
            {errors.documentTitle && <div className="error">{errors.documentTitle}</div>}
          </div>
          <div>
            <select
              className="select"
              value={form.documentType}
              onChange={setField("documentType")}
            >
              <option value="Title Commitment">Title Commitment</option>
              <option value="Deed">Deed</option>
              <option value="Settlement Instruction">Settlement Instruction</option>
              <option value="Payoff Statement">Payoff Statement</option>
              <option value="Wire Instruction">Wire Instruction</option>
              <option value="Closing Package">Closing Package</option>
              <option value="Other">Other</option>
            </select>
            {errors.documentType && <div className="error">{errors.documentType}</div>}
          </div>
          <div>
            <input
              className="input"
              placeholder="Jurisdiction *"
              value={form.jurisdiction}
              onChange={setField("jurisdiction")}
            />
            {errors.jurisdiction && <div className="error">{errors.jurisdiction}</div>}
          </div>
          <div>
            <input
              className="input"
              type="number"
              min="1"
              placeholder="Version"
              value={form.version}
              onChange={setField("version")}
            />
          </div>
        </div>

        <textarea
          className="textarea"
          placeholder="Optional notes for the pilot, file operator, or compliance review"
          value={form.notes}
          onChange={setField("notes")}
        />

        <div style={{ marginTop: "12px" }}>
          <label className="muted" style={{ display: "block", marginBottom: "8px" }}>
            Trusted reference file *
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="input"
            onChange={(event) => {
              const nextFile = event.target.files[0] || null;
              setFile(nextFile);
              setErrors((prev) => {
                const next = { ...prev };
                const fileError = validators.file(nextFile, ["application/pdf", "image/jpeg", "image/png"], 10);
                if (fileError) {
                  next.file = fileError;
                } else {
                  delete next.file;
                }
                return next;
              });
            }}
          />
          {errors.file && <div className="error">{errors.file}</div>}
        </div>

        <button type="submit" className="btn-primary btn" style={{ marginTop: "16px" }}>
          Register trusted reference
        </button>
      </form>

      {status && <div className="status" style={{ marginTop: "10px" }}>{status}</div>}

      {savedReference && (
        <section className="receipt-panel" style={{ marginTop: "16px" }}>
          <div className="receipt-top">
            <div>
              <h3 style={{ margin: 0 }}>Reference receipt</h3>
              <p className="muted" style={{ margin: "4px 0 0" }}>
                {savedReference.documentTitle} | {formatStamp(savedReference.createdAt)}
              </p>
            </div>
            <span className="badge badge-good">Registered</span>
          </div>
          <div className="receipt-grid">
            <div>
              <span className="label">File hash</span>
              <div className="mono">{shortHash(fileHash)}</div>
            </div>
            <div>
              <span className="label">Receipt hash</span>
              <div className="mono">{shortHash(receiptHash)}</div>
            </div>
            <div>
              <span className="label">On-chain tx</span>
              <div className="mono">{shortHash(txHash)}</div>
            </div>
          </div>
          <div className="receipt-grid">
            <div>
              <span className="label">Registered by</span>
              <div>{savedReference.uploadedByName || "Signed-in user"}</div>
            </div>
            <div>
              <span className="label">Version</span>
              <div>{savedReference.version || 1}</div>
            </div>
          </div>
          <button
            className="btn"
            type="button"
            onClick={() =>
              copyToClipboard(
                savedReference.receiptHash || "",
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
        </section>
      )}

      <section className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="section-header">
          <div>
            <h3 style={{ margin: 0 }}>Recent trusted references</h3>
            <p className="muted">These are the source records that verification checks will use.</p>
          </div>
        </div>
        <div className="stack">
          {references.length ? (
            references.slice(0, 6).map((reference) => (
              <article key={reference.id} className="reference-card">
                <div className="receipt-top">
                  <div>
                    <h4 style={{ margin: 0 }}>{reference.documentTitle}</h4>
                    <p className="muted" style={{ margin: "4px 0 0" }}>
                      {reference.documentType} | {reference.jurisdiction}
                    </p>
                  </div>
                  <span className={`badge ${reference.onChainTxHash ? "badge-good" : "badge-muted"}`}>
                    {reference.onChainTxHash ? "On-chain" : "Pending"}
                  </span>
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  Registered on {formatStamp(reference.createdAt)} by{" "}
                  {reference.uploadedByName || "Unknown"}
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
            <div className="empty-state">No references have been registered yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
