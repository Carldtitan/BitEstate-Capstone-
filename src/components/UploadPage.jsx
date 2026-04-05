import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { generateHash } from "../hash";
import { logHash } from "../contract.js";
import { buildRecordHash } from "../utils/recordHash";
import { copyToClipboard } from "../utils/clipboard";
import { sanitizeText, validators } from "../utils/validation";
import { listTrustedReferences, saveTrustedReference } from "../services/bitestateStore";

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

export default function UploadPage() {
  const { user, login, isAdmin } = useAuth();
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
      setUnlockStatus("Unlocked.");
      return;
    }
    setUnlocked(false);
    setUnlockStatus("Wrong code.");
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

    if (!walletAddress) {
      const address = await connectWallet();
      if (!address) {
        setStatus(walletError || "Connect a wallet.");
        return;
      }
    }

    const chainId =
      typeof window !== "undefined" && window.ethereum
        ? await window.ethereum.request({ method: "eth_chainId" })
        : "";
    if (chainId !== SEPOLIA_CHAIN_ID) {
      setStatus("Switch to Sepolia.");
      return;
    }

    setStatus("Hashing source...");
    setTxHash("");
    setReceiptHash("");
    setFileHash("");
    setSavedReference(null);

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
      setStatus("Writing to Sepolia...");
      const nextTxHash = await logHash(nextFileHash);
      setTxHash(nextTxHash);

      const reference = await saveTrustedReference({
        documentTitle: sanitizeText(form.sourceTitle),
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
      setStatus("Saved.");
    } catch (error) {
      console.error(error);
      setStatus(error?.message || "Save failed.");
    }
  };

  const isReady = Boolean(user && isAdmin && unlocked && walletAddress && networkOk);

  return (
    <div className="layout section">
      <div className="section-header">
        <div>
          <p className="badge">Source of Truth</p>
          <h2 style={{ margin: 0 }}>Upload a source</h2>
          <p className="muted" style={{ marginTop: "8px" }}>
            Device code + wallet + Sepolia.
          </p>
        </div>
      </div>

      <div className="status" style={{ marginBottom: "16px" }}>
        <div>Signed in as {user?.displayName || user?.email || "Not signed in"}</div>
        <div className="muted" style={{ marginTop: "6px" }}>
          Wallet: {walletAddress ? shortHash(walletAddress) : "Not connected"} | Chain:{" "}
          {walletAddress ? (networkOk ? "Sepolia" : "Wrong network") : "Not connected"}
        </div>
        <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {!user ? (
            <button className="btn-primary btn" type="button" onClick={login}>
              Sign in
            </button>
          ) : null}
          <button className="btn" type="button" onClick={connectWallet}>
            {walletAddress ? "Reconnect wallet" : "Connect wallet"}
          </button>
          <span className={`badge ${isAdmin ? "badge-good" : "badge-warn"}`}>
            {isAdmin ? "Registry account" : "Not approved"}
          </span>
          <span className={`badge ${unlocked ? "badge-good" : "badge-warn"}`}>
            {unlocked ? "Unlocked" : "Locked"}
          </span>
        </div>
        {walletError && <div className="error" style={{ marginTop: "10px" }}>{walletError}</div>}
      </div>

      <div className="form-card">
        <div className="receipt-top">
          <div>
            <h3 style={{ margin: 0 }}>Unlock</h3>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              Enter the device code to open the write path.
            </p>
          </div>
          <span className={`badge ${unlocked ? "badge-good" : "badge-warn"}`}>
            {unlocked ? "Open" : "Closed"}
          </span>
        </div>
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
        <p className="muted" style={{ marginTop: "10px" }}>
          {unlockStatus || "Registry only."}
        </p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <input
              className="input"
              placeholder="Source title *"
              value={form.sourceTitle}
              onChange={setField("sourceTitle")}
            />
            {errors.sourceTitle && <div className="error">{errors.sourceTitle}</div>}
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
          placeholder="Notes"
          value={form.notes}
          onChange={setField("notes")}
        />

        <div style={{ marginTop: "12px" }}>
          <label className="muted" style={{ display: "block", marginBottom: "8px" }}>
            File *
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

        <button type="submit" className="btn-primary btn" style={{ marginTop: "16px" }} disabled={!isReady}>
          Save source on Sepolia
        </button>
        {!isReady && (
          <p className="muted" style={{ marginTop: "10px" }}>
            {user ? null : "Sign in. "}
            {!isAdmin ? "Use a registry account. " : null}
            {!unlocked ? "Unlock the form. " : null}
            {!walletAddress ? "Connect a wallet. " : null}
            {!networkOk ? "Switch to Sepolia." : null}
          </p>
        )}
      </form>

      {status && <div className="status" style={{ marginTop: "10px" }}>{status}</div>}

      {savedReference && (
        <section className="receipt-panel" style={{ marginTop: "16px" }}>
          <div className="receipt-top">
            <div>
              <h3 style={{ margin: 0 }}>Receipt</h3>
              <p className="muted" style={{ margin: "4px 0 0" }}>
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
          <div className="receipt-grid">
            <div>
              <span className="label">Version</span>
              <div>{savedReference.version || 1}</div>
            </div>
            <div>
              <span className="label">Saved by</span>
              <div>{savedReference.uploadedByName || "Signed-in user"}</div>
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

      <section className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="section-header">
          <div>
            <h3 style={{ margin: 0 }}>Recent sources</h3>
            <p className="muted" style={{ marginTop: "8px" }}>
              The last few source records.
            </p>
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
                  Registered {formatStamp(reference.createdAt)}
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
            <div className="empty-state">No sources yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
