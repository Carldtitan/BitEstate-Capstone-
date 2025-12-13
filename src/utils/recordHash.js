import crypto from "crypto-js";

// Build a deterministic record hash from file hash + required fields.
// Required fields must include: owner, ownerId, propertyTitle, propertyType, location, size, beds, baths, year.
export function buildRecordHash(fileHash, fields) {
  const meta = {
    owner: fields.owner || "",
    ownerId: fields.ownerId || "",
    propertyTitle: fields.propertyTitle || "",
    propertyType: fields.propertyType || "",
    location: fields.location || "",
    size: fields.size || "",
    beds: fields.beds || "",
    baths: fields.baths || "",
    year: fields.year || "",
  };
  const metaHash = crypto.SHA256(JSON.stringify(meta)).toString();
  return crypto.SHA256(fileHash + metaHash).toString();
}
