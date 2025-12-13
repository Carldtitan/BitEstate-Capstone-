import { useState } from "react";
import { generateHash } from "../hash";
import { verifyHash } from "../contract.js";
import { useWallet } from "../context/WalletContext";

export default function VerifyPage() {
  const [referenceFile, setReferenceFile] = useState(null);
  const [candidateFile, setCandidateFile] = useState(null);
  const [status, setStatus] = useState("");
  const [hashes, setHashes] = useState({ reference: "", candidate: "" });
  const [chainStatus, setChainStatus] = useState("");
  const { walletAddress, connectWallet } = useWallet();

  const handleVerify = async () => {
    if (!referenceFile || !candidateFile) {
      setStatus("Upload both PDFs to compare.");
      return;
    }
    setStatus("Computing hashes...");
    setChainStatus("");
    try {
      const [refHash, candHash] = await Promise.all([
        generateHash(referenceFile),
        generateHash(candidateFile),
      ]);
      setHashes({ reference: refHash, candidate: candHash });
      const match = refHash === candHash;
      setStatus(match ? "Exact match ✅" : "Files differ ❌");
      try {
        const found = await verifyHash(candHash);
        setChainStatus(found ? "On-chain record found for this document." : "No on-chain record.");
      } catch (err) {
        setChainStatus("On-chain check unavailable (mock or missing wallet).");
      }
    } catch (err) {
      setStatus("Failed to hash files");
    }
  };

  return (
    <div className="layout section">
      <h2 style={{ marginTop: 0 }}>Verify title document</h2>
      <p className="muted">
        Upload the original PDF and the PDF you want to validate. We compute SHA-256 hashes in the
        browser and tell you if they are identical. If connected to a blockchain RPC, we also check
        for an on-chain registration.
      </p>
      {!walletAddress && (
        <div className="status" style={{ marginBottom: "10px" }}>
          <button className="btn-primary btn" onClick={connectWallet}>
            Connect wallet (for on-chain logging)
          </button>
        </div>
      )}
      <div className="form-card">
        <div className="form-grid">
          <div>
            <label className="muted">Reference PDF (ground truth)</label>
            <input
              type="file"
              accept="application/pdf"
              className="input"
              onChange={(e) => setReferenceFile(e.target.files[0])}
            />
          </div>
          <div>
            <label className="muted">Document to verify</label>
            <input
              type="file"
              accept="application/pdf"
              className="input"
              onChange={(e) => setCandidateFile(e.target.files[0])}
            />
          </div>
        </div>
        <button className="btn-primary btn" style={{ marginTop: "16px" }} onClick={handleVerify}>
          Compare PDFs
        </button>
        {status && <div className="status" style={{ marginTop: "12px" }}>{status}</div>}
        {chainStatus && <div className="status" style={{ marginTop: "8px" }}>{chainStatus}</div>}
        {(hashes.reference || hashes.candidate) && (
          <table className="table" style={{ marginTop: "14px" }}>
            <thead>
              <tr>
                <th>File</th>
                <th>SHA-256 hash</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Reference</td>
                <td className="muted" style={{ wordBreak: "break-all" }}>
                  {hashes.reference}
                </td>
              </tr>
              <tr>
                <td>Candidate</td>
                <td className="muted" style={{ wordBreak: "break-all" }}>
                  {hashes.candidate}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
