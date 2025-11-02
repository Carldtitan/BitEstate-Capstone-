import { useState } from "react";
import { generateHash } from "../hash";
import { logHash } from "../contract";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState("");

  const pageStyle = {
    textAlign: "center",
    color: "white",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    minHeight: "100vh",
    paddingTop: "80px",
    fontFamily: "sans-serif",
  };

  const buttonStyle = {
    background: "#00bcd4",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "10px",
  };

  const handleUpload = async () => {
    if (!file) return alert("Choose a file first");
    const h = await generateHash(file);
    setHash(h);
    setStatus("Hash generated. Logging (mock)...");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("✅ Hash logged successfully (mock)");
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ color: "#00bcd4", marginBottom: "20px" }}>Upload Property Document</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br />
      <button style={buttonStyle} onClick={handleUpload}>Upload & Log</button>
      <p style={{ marginTop: "20px", color: "#00bcd4" }}>{hash}</p>
      <p>{status}</p>
    </div>
  );
}
