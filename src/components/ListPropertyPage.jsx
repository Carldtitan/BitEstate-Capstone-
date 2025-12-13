import { useState } from "react";
import { verifyHash } from "../contract.js";
import { generateHash } from "../hash";
import { db } from "../services/firebaseClient";
import { addDoc, collection, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { buildRecordHash } from "../utils/recordHash";
import { useWallet } from "../context/WalletContext";

export default function ListPropertyPage() {
  const [form, setForm] = useState({
    ownerFirst: "",
    ownerLast: "",
    ownerId: "",
    contact: "",
    propertyTitle: "",
    propertyType: "",
    location: "",
    size: "",
    beds: "",
    baths: "",
    price: "",
    year: "",
    description: "",
    docFile: null,
  });
  const [status, setStatus] = useState("");
  const [hash, setHash] = useState("");
  const [canRegister, setCanRegister] = useState(false);
  const [pending, setPending] = useState(false);
  const { isAdmin } = useAuth();
  const { walletAddress, connectWallet, networkOk, walletError } = useWallet();

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const saveListing = async (docHash, verified, contractId) => {
    const priceNumber = Number(form.price) || 0;
    const sizeNumber = Number(form.size) || 0;
    await addDoc(collection(db, "listings"), {
      title: form.propertyTitle || "Untitled",
      city: form.location,
      priceUsd: priceNumber,
      beds: Number(form.beds) || 0,
      baths: Number(form.baths) || 0,
      area: sizeNumber,
      owner: `${form.ownerFirst} ${form.ownerLast}`.trim(),
      ownerWallet: walletAddress,
      propertyType: form.propertyType,
      description: form.description,
      docHash,
      verified,
      contractId: contractId ?? null,
      image: "https://via.placeholder.com/400x260?text=Listing",
      createdAt: serverTimestamp(),
    });
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
      "beds",
      "baths",
      "price",
      "year",
      "description",
      "docFile",
    ];
    for (const field of required) {
      if (!form[field]) {
        setStatus("Please complete all required fields.");
        return;
      }
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

    setStatus("Hashing deed and verifying ownership...");
    setCanRegister(false);
    try {
      const fileHash = await generateHash(form.docFile);
      const recordHash = buildRecordHash(fileHash, {
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
      setHash(recordHash);
      const verified = await verifyHash(recordHash);
      let contractId = null;

      if (!verified) {
      setStatus("Title hash not found on-chain. An admin must register it before it is on-chain.");
        return;
      }

      const q = query(collection(db, "registry"), where("docHash", "==", recordHash), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const reg = snap.docs[0].data();
        const numId = Number(reg.contractId);
        contractId = Number.isFinite(numId) ? numId : null;
        // enforce identity match
        const namesMatch =
          reg.ownerFirst?.toLowerCase().trim() === form.ownerFirst.toLowerCase().trim() &&
          reg.ownerLast?.toLowerCase().trim() === form.ownerLast.toLowerCase().trim();
        const idMatch = reg.ownerId === form.ownerId;
        const propertyMatch =
          reg.propertyTitle === form.propertyTitle &&
          reg.propertyType === form.propertyType &&
          String(reg.location || "").toLowerCase().trim() === String(form.location || "").toLowerCase().trim() &&
          Number(reg.size) === Number(form.size) &&
          Number(reg.beds) === Number(form.beds) &&
          Number(reg.baths) === Number(form.baths) &&
          String(reg.year) === String(form.year);
        if (!(namesMatch && idMatch && propertyMatch)) {
          setStatus("This property belongs to another owner. Identity or details mismatch.");
          return;
        }
      } else {
        setStatus("Registry entry missing for this hash. Contact admin.");
        return;
      }

      if (!contractId) {
        setStatus("Hash is registered but no on-chain listing exists yet.");
        return;
      }

      // prevent duplicate listings
      const dupQ = query(collection(db, "listings"), where("docHash", "==", recordHash), limit(1));
      const dupSnap = await getDocs(dupQ);
      if (!dupSnap.empty) {
        setStatus("This property is already listed. Duplicate listings are blocked.");
        return;
      }

      setStatus("Title hash verified. Property listed for purchase.");
      await saveListing(recordHash, true, Number(contractId));
    } catch (err) {
      setStatus(err?.message || "Failed to process document. Check file and try again.");
    }
  };

  const handleRegisterHash = async () => {
    if (!hash) {
      setStatus("Please hash/verify first.");
      return;
    }
    if (!isAdmin) {
      setStatus("Only admins can register hashes on-chain.");
      return;
    }
    setPending(true);
    setStatus("Please ask an admin to register this hash on-chain.");
    setPending(false);
  };

  return (
    <div className="layout section">
      <h2 style={{ marginTop: 0 }}>List a property for sale</h2>
      <p className="muted">
        Hash your deed, check the chain, and save a listing record. If the hash is not on-chain, you
        can register it before publishing.
      </p>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input
            className="input"
            placeholder="Owner first name *"
            onChange={handleChange("ownerFirst")}
          />
          <input
            className="input"
            placeholder="Owner last name *"
            onChange={handleChange("ownerLast")}
          />
          <input
            className="input"
            placeholder="National ID / Passport Number *"
            onChange={handleChange("ownerId")}
          />
          <input
            className="input"
            placeholder="Contact Email or Phone Number *"
            onChange={handleChange("contact")}
          />
          <input
            className="input"
            placeholder="Official Property Title (as on Deed) *"
            onChange={handleChange("propertyTitle")}
          />
          <select className="select" onChange={handleChange("propertyType")}>
            <option value="">Select Property Type *</option>
            <option value="Residential House">Residential House</option>
            <option value="Apartment">Apartment</option>
            <option value="Land">Land / Plot</option>
            <option value="Commercial Property">Commercial Property</option>
          </select>
          <input
            className="input"
            placeholder="Property Location (City, Region, Country) *"
            onChange={handleChange("location")}
          />
          <input
            className="input"
            placeholder="Property Size (in sqft or acres) *"
            onChange={handleChange("size")}
          />
          <input
            className="input"
            placeholder="Beds *"
            type="number"
            onChange={handleChange("beds")}
          />
          <input
            className="input"
            placeholder="Baths *"
            type="number"
            onChange={handleChange("baths")}
          />
          <input className="input" placeholder="Year of Ownership *" onChange={handleChange("year")} />
          <input
            className="input"
            placeholder="Expected Selling Price (USD) *"
            onChange={handleChange("price")}
          />
        </div>
        <textarea
          className="textarea"
          placeholder="Short Property Description *"
          onChange={handleChange("description")}
        />
        <div>
          <label className="muted" style={{ display: "block", marginTop: "10px" }}>
            Upload Title Deed (PDF/JPG/PNG) *
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="input"
            onChange={(e) => setForm((prev) => ({ ...prev, docFile: e.target.files[0] }))}
          />
        </div>

        <button type="submit" className="btn-primary btn" style={{ marginTop: "14px" }}>
          Verify & Save Listing
        </button>
        {canRegister && isAdmin && (
          <button
            type="button"
            className="btn"
            style={{ marginTop: "10px" }}
            disabled={pending}
            onClick={handleRegisterHash}
          >
            {pending ? "Registering..." : "Register this hash now"}
          </button>
        )}
        {status && (
          <div className="status" style={{ marginTop: "10px" }}>
            {status}
          </div>
        )}
        {hash && (
          <div className="status" style={{ marginTop: "8px", wordBreak: "break-all" }}>
            Document hash: {hash}
          </div>
        )}
      </form>
    </div>
  );
}
