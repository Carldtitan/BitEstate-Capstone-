import React, { useState } from "react";
import { generateHash } from "./hash";
import { logHash, verifyHash } from "./contract";

export default function App() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Choose a file first");
    const h = await generateHash(file);
    setHash(h);
    setStatus("Hash generated, logging to blockchain...");
    await logHash(h);
    setStatus("File hash logged on blockchain ✅");
  };

  const handleVerify = async () => {
    if (!file) return alert("Choose a file first");
    const h = await generateHash(file);
    const exists = await verifyHash(h);
    setStatus(exists ? "✅ Document verified" : "❌ Document not found");
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Bit Estate Verifier</h1>
      <input type="file" onChange={handleFileChange} />
      <div style={{ marginTop: 10 }}>
        <button onClick={handleUpload}>Upload & Log</button>
        <button onClick={handleVerify} style={{ marginLeft: 8 }}>Verify</button>
      </div>
      <p>Hash: {hash}</p>
      <p>Status: {status}</p>
    </div>
  );
}
