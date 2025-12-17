import { useState } from "react";
import { generateHash } from "../hash";
import { logHash, createListing, PRICE_WEI } from "../contract.js";
import { buildRecordHash } from "../utils/recordHash";
import { db } from "../services/firebaseClient";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useWallet } from "../context/WalletContext";
import { validators, sanitizeText } from "../utils/validation";
import { copyToClipboard } from "../utils/clipboard";
import Modal from "./Modal";

export default function UploadPage() {
  const [form, setForm] = useState({
    ownerFirst: "",
    ownerLast: "",
    ownerId: "",
    contact: "",
    propertyTitle: "",
    propertyType: "",
    location: "",
    size: "",
    year: "",
    parcelId: "",
    registryRef: "",
    issuingAuthority: "",
    beds: "",
    baths: "",
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [fileHash, setFileHash] = useState("");
  const [metadataHash, setMetadataHash] = useState("");
  const [tx, setTx] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [modal, setModal] = useState({ open: false, title: "", message: "", type: "error" });
  const { walletAddress, connectWallet, networkOk, walletError } = useWallet();

  const validateField = (name, value) => {
    switch (name) {
      case "ownerFirst":
      case "ownerLast":
        return validators.text(value, name === "ownerFirst" ? "First name" : "Last name");
      case "ownerId":
        return validators.nationalId(value);
      case "contact":
        return validators.contact(value);
      case "propertyTitle":
        return validators.propertyTitle(value);
      case "propertyType":
        return value ? null : "Property type is required";
      case "location":
        return validators.text(value, "Location");
      case "size":
        return validators.number(value, "Size", 0);
      case "beds":
      case "baths":
        return validators.number(value, name === "beds" ? "Beds" : "Baths", 0, 20);
      case "year":
        const year = Number(value);
        if (!value) return "Year is required";
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
          return `Year must be between 1900 and ${new Date().getFullYear()}`;
        }
        return null;
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      "ownerFirst",
      "ownerLast",
      "ownerId",
      "contact",
      "propertyTitle",
      "propertyType",
      "location",
      "size",
      "year",
      "beds",
      "baths",
    ];
    
    // Validate all required fields
    const newErrors = {};
    for (const field of required) {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    }
    
    // Validate file
    const fileError = validators.file(file);
    if (fileError) {
      newErrors.file = fileError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus("Please fix the errors below before submitting.");
      return;
    }

    setErrors({});
    if (!walletAddress) {
      const addr = await connectWallet();
      if (!addr) {
        setStatus(walletError || "Wallet not found. Please install MetaMask.");
        return;
      }
    }
    if (!networkOk) {
      setStatus("Please switch your wallet to Sepolia (chainId 0xaa36a7).");
      return;
    }

    setStatus("Hashing document and metadata...");
    setTx("");
    try {
      const fh = await generateHash(file);
      setFileHash(fh);
      const recordHash = buildRecordHash(fh, {
        owner: sanitizeText(`${form.ownerFirst} ${form.ownerLast}`),
        ownerId: sanitizeText(form.ownerId),
        propertyTitle: sanitizeText(form.propertyTitle),
        propertyType: sanitizeText(form.propertyType),
        location: sanitizeText(form.location),
        size: sanitizeText(form.size),
        beds: form.beds,
        baths: form.baths,
        year: sanitizeText(form.year),
      });
      setMetadataHash(recordHash);
      setStatus("Submitting record hash on-chain...");
      const txHash = await logHash(recordHash);
      setStatus("Publishing on-chain listing...");
      const contractId = Number(`${Date.now()}`.slice(-9));
      const listTx = await createListing(contractId, PRICE_WEI);
      setTx(listTx);
      setStatus("Submitted. Keep the hashes below for verification.");

      await addDoc(collection(db, "registry"), {
        docHash: recordHash,
        contractId: Number(contractId),
        ownerFirst: sanitizeText(form.ownerFirst),
        ownerLast: sanitizeText(form.ownerLast),
        ownerId: sanitizeText(form.ownerId),
        ownerWallet: walletAddress,
        propertyTitle: sanitizeText(form.propertyTitle),
        propertyType: sanitizeText(form.propertyType),
        location: sanitizeText(form.location),
        size: sanitizeText(form.size),
        beds: Number(form.beds) || 0,
        baths: Number(form.baths) || 0,
        year: sanitizeText(form.year),
        contact: sanitizeText(form.contact),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      const raw =
        err?.reason || err?.error?.message || err?.data?.message || err?.message || String(err);
      let short = raw;
      const m = /revert(?:ed)?:?\s*(.*)/i.exec(raw);
      if (m && m[1]) short = m[1];
      setModal({ open: true, title: "Upload Error", message: raw, type: "error" });
      setStatus("Failed to submit hash");
    }
  };

  const setField = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="layout section">
      <h2 style={{ marginTop: 0 }}>Upload & register title deed</h2>
      <p className="muted">
        Government/registry users: capture basic deed details and register the deed hash on-chain.
        Keep it simple—no market/pricing data. Optional registry fields can be added later.
      </p>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <input
              className="input"
              placeholder="Owner first name *"
              onChange={setField("ownerFirst")}
            />
            {errors.ownerFirst && <div className="error">{errors.ownerFirst}</div>}
          </div>
          <div>
            <input
              className="input"
              placeholder="Owner last name *"
              onChange={setField("ownerLast")}
            />
            {errors.ownerLast && <div className="error">{errors.ownerLast}</div>}
          </div>
          <div>
            <input
              className="input"
              placeholder="National ID / Passport *"
              onChange={setField("ownerId")}
            />
            {errors.ownerId && <div className="error">{errors.ownerId}</div>}
          </div>
          <div>
            <input
              className="input"
              placeholder="Registry contact (email or phone) *"
              onChange={setField("contact")}
            />
            {errors.contact && <div className="error">{errors.contact}</div>}
          </div>
          <div>
            <input
              className="input"
              placeholder="Official Property Title *"
              onChange={setField("propertyTitle")}
            />
            {errors.propertyTitle && <div className="error">{errors.propertyTitle}</div>}
          </div>
          <div>
            <select className="select" onChange={setField("propertyType")}>
              <option value="">Select Property Type *</option>
              <option value="Residential House">Residential House</option>
              <option value="Apartment">Apartment</option>
              <option value="Land">Land / Plot</option>
              <option value="Commercial Property">Commercial Property</option>
            </select>
            {errors.propertyType && <div className="error">{errors.propertyType}</div>}
          </div>
          <div>
            <input
              className="input"
              placeholder="Location (City, Country) *"
              onChange={setField("location")}
            />
            {errors.location && <div className="error">{errors.location}</div>}
          </div>
          <div>
            <input
              className="input"
              placeholder="Property Size (sqft or acres) *"
              onChange={setField("size")}
            />
            {errors.size && <div className="error">{errors.size}</div>}
          </div>
          <div>
            <input className="input" placeholder="Beds *" type="number" onChange={setField("beds")} />
            {errors.beds && <div className="error">{errors.beds}</div>}
          </div>
          <div>
            <input
              className="input"
              placeholder="Baths *"
              type="number"
              onChange={setField("baths")}
            />
            {errors.baths && <div className="error">{errors.baths}</div>}
          </div>
          <div>
            <input
              className="input"
              placeholder="Year of ownership *"
              onChange={setField("year")}
            />
            {errors.year && <div className="error">{errors.year}</div>}
          </div>
          <input
            className="input"
            placeholder="Parcel / Title Number (optional)"
            onChange={setField("parcelId")}
          />
          <input
            className="input"
            placeholder="Registry Reference ID (optional)"
            onChange={setField("registryRef")}
          />
          <input
            className="input"
            placeholder="Issuing Authority / Registry (optional)"
            onChange={setField("issuingAuthority")}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <label className="muted">Upload Title Deed (PDF/JPG/PNG) *</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="input"
            onChange={(e) => {
              setFile(e.target.files[0]);
              if (e.target.files[0]) {
                const fileError = validators.file(e.target.files[0]);
                if (fileError) {
                  setErrors((prev) => ({ ...prev, file: fileError }));
                } else {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.file;
                    return next;
                  });
                }
              }
            }}
          />
          {errors.file && <div className="error">{errors.file}</div>}
        </div>
        <button type="submit" className="btn-primary btn" style={{ marginTop: "14px" }}>
          Upload & Register
        </button>
      </form>
      {status && (
        <div className="status" style={{ marginTop: "10px" }}>
          {status}
        </div>
      )}
      {fileHash && (
        <div className="status" style={{ marginTop: "8px", wordBreak: "break-all" }}>
          File hash: {fileHash}
          <button
            className="btn"
            style={{ marginLeft: "8px", padding: "4px 8px", fontSize: "12px" }}
            onClick={() =>
              copyToClipboard(
                fileHash,
                () => {
                  setCopyFeedback("file");
                  setTimeout(() => setCopyFeedback(""), 2000);
                },
                () => setStatus("Failed to copy")
              )
            }
          >
            {copyFeedback === "file" ? "✓ Copied" : "Copy"}
          </button>
        </div>
      )}
      {metadataHash && (
        <div className="status" style={{ marginTop: "8px", wordBreak: "break-all" }}>
          Record hash (file + required fields): {metadataHash}
          <button
            className="btn"
            style={{ marginLeft: "8px", padding: "4px 8px", fontSize: "12px" }}
            onClick={() =>
              copyToClipboard(
                metadataHash,
                () => {
                  setCopyFeedback("metadata");
                  setTimeout(() => setCopyFeedback(""), 2000);
                },
                () => setStatus("Failed to copy")
              )
            }
          >
            {copyFeedback === "metadata" ? "✓ Copied" : "Copy"}
          </button>
        </div>
      )}
      {tx && (
        <div className="status" style={{ marginTop: "8px", wordBreak: "break-all" }}>
          Tx: {tx}
        </div>
      )}
      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />
    </div>
  );
}
