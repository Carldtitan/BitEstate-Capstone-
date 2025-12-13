import { useState } from "react";
import { generateHash } from "../hash";
import { logHash, createListing, PRICE_WEI } from "../contract.js";
import { buildRecordHash } from "../utils/recordHash";
import { db } from "../services/firebaseClient";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useWallet } from "../context/WalletContext";

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
  const [fileHash, setFileHash] = useState("");
  const [metadataHash, setMetadataHash] = useState("");
  const [tx, setTx] = useState("");
  const { walletAddress, connectWallet, networkOk, walletError } = useWallet();

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
    for (const field of required) {
      if (!form[field]) {
        setStatus("Please complete all required fields.");
        return;
      }
    }
    if (!file) {
      setStatus("Choose a title deed file to register.");
      return;
    }
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
        owner: `${form.ownerFirst} ${form.ownerLast}`.trim(),
        ownerId: form.ownerId,
        propertyTitle: form.propertyTitle,
        propertyType: form.propertyType,
        location: form.location,
        size: form.size,
        beds: form.beds,
        baths: form.baths,
        year: form.year,
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
        ownerFirst: form.ownerFirst,
        ownerLast: form.ownerLast,
        ownerId: form.ownerId,
        ownerWallet: walletAddress,
        propertyTitle: form.propertyTitle,
        propertyType: form.propertyType,
        location: form.location,
        size: form.size,
        beds: Number(form.beds) || 0,
        baths: Number(form.baths) || 0,
        year: form.year,
        contact: form.contact,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      setStatus(err.message || "Failed to submit hash");
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
          <input className="input" placeholder="Owner first name *" onChange={setField("ownerFirst")} />
          <input className="input" placeholder="Owner last name *" onChange={setField("ownerLast")} />
          <input
            className="input"
            placeholder="National ID / Passport *"
            onChange={setField("ownerId")}
          />
          <input
            className="input"
            placeholder="Registry contact (email or phone) *"
            onChange={setField("contact")}
          />
          <input
            className="input"
            placeholder="Official Property Title *"
            onChange={setField("propertyTitle")}
          />
          <select className="select" onChange={setField("propertyType")}>
            <option value="">Select Property Type *</option>
            <option value="Residential House">Residential House</option>
            <option value="Apartment">Apartment</option>
            <option value="Land">Land / Plot</option>
            <option value="Commercial Property">Commercial Property</option>
          </select>
          <input
            className="input"
            placeholder="Location (City, Country) *"
            onChange={setField("location")}
          />
          <input
            className="input"
            placeholder="Property Size (sqft or acres) *"
            onChange={setField("size")}
          />
          <input className="input" placeholder="Beds *" type="number" onChange={setField("beds")} />
          <input
            className="input"
            placeholder="Baths *"
            type="number"
            onChange={setField("baths")}
          />
          <input
            className="input"
            placeholder="Year of ownership *"
            onChange={setField("year")}
          />
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
            onChange={(e) => setFile(e.target.files[0])}
          />
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
        </div>
      )}
      {metadataHash && (
        <div className="status" style={{ marginTop: "8px", wordBreak: "break-all" }}>
          Record hash (file + required fields): {metadataHash}
        </div>
      )}
      {tx && (
        <div className="status" style={{ marginTop: "8px", wordBreak: "break-all" }}>
          Tx: {tx}
        </div>
      )}
    </div>
  );
}
