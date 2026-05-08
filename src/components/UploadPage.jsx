import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, DatabaseZap, FileUp, KeyRound, LockKeyhole, WalletCards } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { generateHash } from "../hash";
import { logHash } from "../contract.js";
import { buildRecordHash } from "../utils/recordHash";
import { copyToClipboard } from "../utils/clipboard";
import { sanitizeText, validators } from "../utils/validation";
import { checkRegistryStorage, listTrustedReferences, saveTrustedReference } from "../services/bitestateStore";
import FilePicker from "./FilePicker";
import HelpTooltip from "./HelpTooltip";

const DEVICE_CODE = process.env.REACT_APP_REGISTRY_DEVICE_CODE || "246801";
const UNLOCK_STORAGE_KEY = "bitestate_source_truth_unlocked_v1";
const SEPOLIA_CHAIN_ID = "0xaa36a7";

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

function readUnlocked() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(UNLOCK_STORAGE_KEY) === "1";
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
        {text ? <p>{text}</p> : null}
      </div>
    </div>
  );
}

function StatusTile({ icon: Icon, label, value, active }) {
  return (
    <div className={`status-tile${active ? " active" : ""}`}>
      <span className="status-tile-icon" aria-hidden="true">
        <Icon size={17} />
      </span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function dbMessage(error) {
  if (error?.code === "permission-denied") return "Database permission blocked.";
  if (error?.message === "Database unavailable.") return "Database offline.";
  return error?.message || "Save failed.";
}

export default function UploadPage() {
  const { user, login, isAdmin, authError } = useAuth();
  const { walletAddress, connectWallet, networkOk, walletError } = useWallet();
  const [form, setForm] = useState({
    sourceTitle: "",
    documentType: "Title Commitment",
    jurisdiction: "California",
    version: "1",
    notes: "",
  });
  const [file, setFile] = useState(null);
  const [deviceCode, setDeviceCode] = useState("");
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const [unlockStatus, setUnlockStatus] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [fileHash, setFileHash] = useState("");
  const [receiptHash, setReceiptHash] = useState("");
  const [txHash, setTxHash] = useState("");
  const [savedReference, setSavedReference] = useState(null);
  const [references, setReferences] = useState([]);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [storageReady, setStorageReady] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [storage, nextReferences] = await Promise.all([
          checkRegistryStorage(),
          listTrustedReferences(),
        ]);
        setStorageReady(storage.ok);
        setReferences(nextReferences);
      } catch (error) {
        console.warn("Failed to load trusted references", error);
        setStorageReady(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!user) {
      setUnlocked(false);
      setUnlockStatus("");
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (unlocked) {
      window.sessionStorage.setItem(UNLOCK_STORAGE_KEY, "1");
    } else {
      window.sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
    }
  }, [unlocked]);

  const nextVersion = useMemo(() => {
    if (!references.length) return 1;
    const versions = references
      .filter((reference) => reference.documentTitle === form.sourceTitle)
      .map((reference) => Number(reference.version) || 0);
    const highest = versions.length ? Math.max(...versions) : 0;
    return highest + 1;
  }, [references, form.sourceTitle]);

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleUnlock = () => {
    const code = deviceCode.trim();
    if (!code) {
      setUnlockStatus("Enter the device code.");
      return;
    }
    if (code === DEVICE_CODE) {
      setUnlocked(true);
      setUnlockStatus("Access open.");
      return;
    }
    setUnlocked(false);
    setUnlockStatus("Code not recognized.");
  };

  const validate = () => {
    const nextErrors = {};
    const titleError = validators.text(form.sourceTitle, "Source title");
    if (titleError) {
      nextErrors.sourceTitle = titleError;
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

    if (!user) {
      setStatus("Sign in first.");
      return;
    }
    if (!isAdmin) {
      setStatus("This account is not approved.");
      return;
    }
    if (!unlocked) {
      setStatus("Unlock the form first.");
      return;
    }

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("Fix the form first.");
      return;
    }

    setStatus("Hashing source...");
    setTxHash("");
    setReceiptHash("");
    setFileHash("");
    setSavedReference(null);
    setSaving(true);

    try {
      const nextFileHash = await generateHash(file);
      const nextReceiptHash = buildRecordHash(nextFileHash, {
        title: sanitizeText(form.sourceTitle),
        documentType: sanitizeText(form.documentType),
        jurisdiction: sanitizeText(form.jurisdiction),
        fileName: file.name,
        version: form.version,
        notes: sanitizeText(form.notes),
        verifiedBy: user.displayName || user.email || "Signed-in user",
        result: "source-of-truth",
      });

      setFileHash(nextFileHash);
      setReceiptHash(nextReceiptHash);
      let nextTxHash = "";
      let onChainRegistered = false;

      if (walletAddress && networkOk) {
        try {
          const chainId =
            typeof window !== "undefined" && window.ethereum
              ? await window.ethereum.request({ method: "eth_chainId" })
              : "";
          if (chainId === SEPOLIA_CHAIN_ID) {
            setStatus("Writing to Sepolia...");
            nextTxHash = await logHash(nextFileHash);
            onChainRegistered = true;
            setTxHash(nextTxHash);
          }
        } catch (error) {
          console.warn("Sepolia write failed; saving local source", error);
        }
      }

      setStatus("Saving source...");

      const reference = await saveTrustedReference({
        documentTitle: sanitizeText(form.sourceTitle),
        documentType: sanitizeText(form.documentType),
        jurisdiction: sanitizeText(form.jurisdiction),
        version: Number(form.version) || nextVersion,
        notes: sanitizeText(form.notes),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        fileHash: nextFileHash,
        receiptHash: nextReceiptHash,
        onChainTxHash: nextTxHash,
        onChainRegistered,
        uploadedByUid: user.uid,
        uploadedByName: user.displayName || "Signed-in user",
        uploadedByEmail: user.email || "",
        createdAt: new Date().toISOString(),
        createdAtMs: Date.now(),
      });

      setSavedReference(reference);
      setReferences((prev) => [reference, ...prev.filter((item) => item.id !== reference.id)]);
      setStatus(onChainRegistered ? "Source saved on Sepolia." : "Source saved.");
      setStorageReady(true);
    } catch (error) {
      console.error(error);
      setStatus(dbMessage(error));
      setStorageReady(false);
    } finally {
      setSaving(false);
    }
  };

  const isReady = Boolean(user && isAdmin && unlocked);
  const canWriteOnChain = Boolean(walletAddress && networkOk);
  const canSubmit = Boolean(isReady && file && form.sourceTitle.trim() && !saving);

  return (
    <div className="layout section">
      <div className="section-header page-intro">
        <div>
          <div className="page-meta">
            <p className="badge">Source</p>
            <span className={`system-pill ${storageReady === false ? "offline" : storageReady ? "online" : ""}`}>
              <DatabaseZap size={13} aria-hidden="true" />
              {storageReady === false ? "DB offline" : storageReady ? "DB online" : "Checking DB"}
            </span>
          </div>
          <div className="title-row">
            <h1>Register source</h1>
            <HelpTooltip>Only the file hash is written. Do not upload private documents you are not allowed to handle.</HelpTooltip>
          </div>
          <p className="page-note">Save the trusted hash used for verification.</p>
        </div>
      </div>

      <div className="source-status-grid">
        <StatusTile
          icon={CheckCircle2}
          label="Account"
          value={user ? "Signed in" : "Sign in required"}
          active={Boolean(user)}
        />
        <StatusTile
          icon={KeyRound}
          label="Registry access"
          value={unlocked ? "Unlocked" : "Locked"}
          active={unlocked}
        />
        <StatusTile
          icon={WalletCards}
          label="Wallet"
          value={walletAddress ? shortHash(walletAddress) : "Optional"}
          active={Boolean(walletAddress)}
        />
        <StatusTile
          icon={DatabaseZap}
          label="Database"
          value={storageReady === false ? "Offline" : storageReady ? "Online" : "Checking"}
          active={storageReady !== false}
        />
      </div>

      <div className="source-action-row">
        {!user ? (
          <button className="btn-primary btn" type="button" onClick={() => login().catch(() => {})}>
            Sign in
          </button>
        ) : null}
        <button className="btn" type="button" onClick={connectWallet}>
          {walletAddress ? "Reconnect wallet" : "Connect wallet"}
        </button>
        {authError && <div className="error inline-error">{authError}</div>}
        {walletError && <div className="error inline-error">{walletError}</div>}
      </div>

      <div className="source-workspace">
        <section className="form-card task-card access-card">
          <TaskHeader
            icon={LockKeyhole}
            step="Access"
            title="Unlock"
            text="Approved registry users only."
          />
          <div className="gate-row">
            <input
              className="input gate-input"
              type="password"
              placeholder="Device code"
              value={deviceCode}
              onChange={(e) => setDeviceCode(e.target.value)}
            />
            <button type="button" className="btn-primary btn" onClick={handleUnlock}>
              Unlock
            </button>
          </div>
          {unlockStatus && <p className="helper-line">{unlockStatus}</p>}
        </section>

        <form className="form-card task-card source-form" onSubmit={handleSubmit}>
          <TaskHeader
            icon={FileUp}
            step="Source details"
            title="Trusted document"
            text="Use the final file."
          />
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label" htmlFor="source-title">Source title</label>
              <input
                id="source-title"
                className="input"
                placeholder="123 Main St title"
                value={form.sourceTitle}
                onChange={setField("sourceTitle")}
              />
              {errors.sourceTitle && <div className="error">{errors.sourceTitle}</div>}
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="document-type">Document type</label>
              <select
                id="document-type"
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
            <div className="field-group">
              <label className="field-label" htmlFor="jurisdiction">Jurisdiction</label>
              <input
                id="jurisdiction"
                className="input"
                placeholder="California"
                value={form.jurisdiction}
                onChange={setField("jurisdiction")}
              />
              {errors.jurisdiction && <div className="error">{errors.jurisdiction}</div>}
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="version">Version</label>
              <input
                id="version"
                className="input"
                type="number"
                min="1"
                value={form.version}
                onChange={setField("version")}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="source-notes">Notes</label>
            <textarea
              id="source-notes"
              className="textarea"
              placeholder="Optional internal note"
              value={form.notes}
              onChange={setField("notes")}
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="source-file">Source file</label>
            <FilePicker
              id="source-file"
              accept=".pdf,.jpg,.jpeg,.png"
              file={file}
              actionLabel="Choose file"
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

          <div className="form-actions">
            <button type="submit" className="btn-primary btn" disabled={!canSubmit}>
              {saving ? "Saving..." : "Save source"}
            </button>
          </div>
          {!isReady && (
            <p className="helper-line">
              {user ? null : "Sign in. "}
              {!isAdmin ? "Use a registry account. " : null}
              {!unlocked ? "Unlock access." : null}
            </p>
          )}
          {status && <div className="status status-strong">{status}</div>}
        </form>
      </div>

      {savedReference && (
        <section className="receipt-panel source-receipt">
          <div className="receipt-top">
            <div>
              <h3>Source receipt</h3>
              <p className="muted">
                {savedReference.documentTitle} | {formatStamp(savedReference.createdAt)}
              </p>
            </div>
            <span className="badge badge-good">Saved</span>
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
              <span className="label">Tx hash</span>
              <div className="mono">{shortHash(txHash)}</div>
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
                () => setStatus("Copy failed.")
              )
            }
          >
            {copyFeedback === "receipt" ? "Copied" : "Copy receipt hash"}
          </button>
        </section>
      )}

      <section className="record-section">
        <div className="section-header compact-header">
          <div className="card-title-row card-title-row-left">
            <DatabaseZap size={20} aria-hidden="true" />
            <h3>Recent sources</h3>
            <HelpTooltip>Trusted source hashes are saved to Firebase. The document file itself is not stored.</HelpTooltip>
          </div>
        </div>
        <div className="record-list">
          {references.length ? (
            references.slice(0, 6).map((reference) => (
              <article key={reference.id} className="record-card">
                <div className="record-card-main">
                  <div>
                    <h4>{reference.documentTitle}</h4>
                    <p>{reference.documentType} | {reference.jurisdiction}</p>
                  </div>
                  <span className={`badge ${reference.onChainTxHash ? "badge-good" : "badge-muted"}`}>
                    {reference.onChainTxHash ? "On-chain" : "Database"}
                  </span>
                </div>
                <div className="record-meta">
                  <span>
                    <Clock3 size={14} aria-hidden="true" />
                    {formatStamp(reference.createdAt)}
                  </span>
                  <span>
                    <DatabaseZap size={14} aria-hidden="true" />
                    {shortHash(reference.receiptHash)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">No sources yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
