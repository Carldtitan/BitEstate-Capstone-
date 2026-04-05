import crypto from "crypto-js";

// Build a deterministic receipt hash from a file hash plus the most important metadata.
// The shape is intentionally flexible so the same helper can support reference registration
// and verification receipts without tying the app to one property-listing workflow.
export function buildRecordHash(fileHash, fields = {}) {
  const meta = {
    title: fields.title || fields.documentTitle || fields.propertyTitle || "",
    documentType: fields.documentType || fields.propertyType || "",
    jurisdiction: fields.jurisdiction || fields.location || "",
    fileName: fields.fileName || "",
    version: fields.version || "",
    notes: fields.notes || "",
    referenceId: fields.referenceId || "",
    verifiedBy: fields.verifiedBy || "",
    result: fields.result || "",
  };
  const metaHash = crypto.SHA256(JSON.stringify(meta)).toString();
  return crypto.SHA256(`${fileHash}:${metaHash}`).toString();
}
