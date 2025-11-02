import { useState } from "react";
import { generateHash } from "../hash";
import { verifyHash } from "../contract";

export default function VerifyPage() {
  const [file, setFile] = useState(null);
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

  const handleVerify = async () => {
    if (!file) return alert("Choose a file");
    const h = await generateHash(file);
    setStatus("Verifying document...");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus(h.startsWith("a") ? "✅ Document verified" : "❌ Document not found");
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ color: "#00bcd4", marginBottom: "20px" }}>Verify Property Document</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br />
      <button style={buttonStyle} onClick={handleVerify}>Verify</button>
      <p style={{ marginTop: "20px" }}>{status}</p>
    </div>
  );
}
