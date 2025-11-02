import { useState } from "react";
import { verifyHash } from "../contract";

export default function ListPropertyPage() {
  const [form, setForm] = useState({
    owner: "",
    ownerId: "",
    contact: "",
    propertyTitle: "",
    propertyType: "",
    location: "",
    size: "",
    price: "",
    year: "",
    description: "",
    docFile: null,
  });
  const [status, setStatus] = useState("");

  const pageStyle = {
    color: "white",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    minHeight: "100vh",
    padding: "60px 20px",
    fontFamily: "sans-serif",
    textAlign: "center",
  };

  const inputStyle = {
    width: "70%",
    padding: "10px",
    margin: "10px auto",
    borderRadius: "6px",
    border: "none",
    display: "block",
  };

  const textAreaStyle = {
    ...inputStyle,
    height: "100px",
  };

  const buttonStyle = {
    padding: "12px 28px",
    border: "none",
    borderRadius: "6px",
    background: "#00bcd4",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px",
    fontSize: "16px",
  };

  const instructionsBox = {
    background: "#1e293b",
    borderRadius: "10px",
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto 40px auto",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    textAlign: "left",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate required fields
    const requiredFields = [
      "owner",
      "ownerId",
      "contact",
      "propertyTitle",
      "propertyType",
      "location",
      "size",
      "price",
      "year",
      "description",
      "docFile",
    ];

    for (const field of requiredFields) {
      if (!form[field]) {
        alert("Please complete all required fields before submitting.");
        return;
      }
    }

    setStatus("Verifying title ownership on blockchain...");
    await new Promise((r) => setTimeout(r, 2000));
    const verified = Math.random() > 0.3; // mock verification
    setStatus(
      verified
        ? "✅ Title verified and property listed successfully!"
        : "❌ Title not found in blockchain registry. Please verify your ownership."
    );
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ color: "#00bcd4", marginBottom: "20px" }}>
        List a Property for Sale
      </h2>

      {/* INSTRUCTIONS */}
      <div style={instructionsBox}>
        <h3 style={{ color: "#00bcd4" }}>Before You List:</h3>
        <ul style={{ lineHeight: "1.6" }}>
          <li>
            Please fill in <strong>all fields below</strong>. Incomplete forms
            will not be accepted.
          </li>
          <li>
            Upload your <strong>official property title deed</strong> (PDF, JPG,
            or PNG). This file is used to verify ownership on the blockchain.
          </li>
          <li>
            Ensure that the <strong>owner name</strong> and{" "}
            <strong>property title</strong> match what appears on the deed.
          </li>
          <li>
            Once verified, your property will be displayed on the{" "}
            <strong>Verified Listings</strong> page with a “Verified on
            Blockchain” tag.
          </li>
        </ul>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <input
          style={inputStyle}
          placeholder="Full Name of Property Owner *"
          required
          onChange={(e) => setForm({ ...form, owner: e.target.value })}
        />
        <input
          style={inputStyle}
          placeholder="National ID / Passport Number *"
          required
          onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
        />
        <input
          style={inputStyle}
          placeholder="Contact Email or Phone Number *"
          required
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
        />
        <input
          style={inputStyle}
          placeholder="Official Property Title (as on Deed) *"
          required
          onChange={(e) => setForm({ ...form, propertyTitle: e.target.value })}
        />
        <select
          style={inputStyle}
          required
          onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
        >
          <option value="">Select Property Type *</option>
          <option value="Residential House">Residential House</option>
          <option value="Apartment">Apartment</option>
          <option value="Land">Land / Plot</option>
          <option value="Commercial Property">Commercial Property</option>
        </select>
        <input
          style={inputStyle}
          placeholder="Property Location (City, Region, Country) *"
          required
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <input
          style={inputStyle}
          placeholder="Property Size (in sq meters or acres) *"
          required
          onChange={(e) => setForm({ ...form, size: e.target.value })}
        />
        <input
          style={inputStyle}
          placeholder="Year of Ownership *"
          required
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        />
        <input
          style={inputStyle}
          placeholder="Expected Selling Price (e.g. $250,000) *"
          required
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <textarea
          style={textAreaStyle}
          placeholder="Short Property Description * (e.g. '3-bedroom duplex in Ikoyi with ocean view...')"
          required
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div>
          <label style={{ display: "block", marginTop: "15px" }}>
            <strong>Upload Title Deed (PDF/JPG/PNG) *</strong>
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            required
            style={{
              ...inputStyle,
              background: "#243447",
              color: "#ccc",
              padding: "12px",
            }}
            onChange={(e) => setForm({ ...form, docFile: e.target.files[0] })}
          />
        </div>

        <button type="submit" style={buttonStyle}>
          Verify Ownership & List Property
        </button>
      </form>

      <p style={{ marginTop: "25px", color: "#00bcd4", fontWeight: "500" }}>
        {status}
      </p>
    </div>
  );
}
