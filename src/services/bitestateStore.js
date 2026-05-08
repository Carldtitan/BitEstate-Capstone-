import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as queryLimit,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import crypto from "crypto-js";
import { getFirebaseDb } from "./firebaseClient";

const REFERENCES_KEY = "bitestate_trusted_references_v1";
const VERIFICATION_LOGS_KEY = "bitestate_verification_logs_v1";
const REFERENCES_COLLECTION = "trustedReferences";
const LOGS_COLLECTION = "verificationLogs";
const SCHEMA_VERSION = 2;

function readLocal(key) {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn(`Could not read ${key}`, error);
    return [];
  }
}

function writeLocal(key, value) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not write ${key}`, error);
  }
}

function makeId(prefix = "item") {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeKeyPart(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function buildSourceKey(entry) {
  return crypto.SHA256(JSON.stringify({
    documentTitle: normalizeKeyPart(entry.documentTitle),
    documentType: normalizeKeyPart(entry.documentType),
    jurisdiction: normalizeKeyPart(entry.jurisdiction),
    version: String(entry.version || 1).trim(),
    fileHash: normalizeKeyPart(entry.fileHash),
  })).toString();
}

function makeReferenceId(entry) {
  return `ref-${buildSourceKey(entry).slice(0, 32)}`;
}

function getReferenceSourceKey(entry) {
  return entry.sourceKey || buildSourceKey(entry);
}

function toTime(value) {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (typeof value?.toMillis === "function") return value.toMillis();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeReference(entry) {
  const createdAt = entry.createdAt || new Date().toISOString();
  const createdAtMs = entry.createdAtMs || toTime(createdAt) || Date.now();
  return {
    active: true,
    ...entry,
    sourceKey: entry.sourceKey || buildSourceKey(entry),
    createdAt,
    createdAtMs,
  };
}

function normalizeLog(entry) {
  const createdAt = entry.createdAt || new Date().toISOString();
  const createdAtMs = entry.createdAtMs || toTime(createdAt) || Date.now();
  return {
    ...entry,
    createdAt,
    createdAtMs,
  };
}

function sortNewest(first, second) {
  return toTime(second.createdAtMs ?? second.createdAt) - toTime(first.createdAtMs ?? first.createdAt);
}

function applyLimit(records, limit) {
  return typeof limit === "number" ? records.slice(0, limit) : records;
}

function pickReferenceToKeep(current, candidate) {
  if (!current) return candidate;
  if (candidate.onChainTxHash && !current.onChainTxHash) return candidate;
  if (current.onChainTxHash && !candidate.onChainTxHash) return current;
  return toTime(candidate.createdAtMs ?? candidate.createdAt) < toTime(current.createdAtMs ?? current.createdAt)
    ? candidate
    : current;
}

function dedupeReferences(records) {
  const unique = new Map();
  records.forEach((record) => {
    const key = getReferenceSourceKey(record);
    unique.set(key, pickReferenceToKeep(unique.get(key), record));
  });
  return Array.from(unique.values()).sort(sortNewest);
}

function getRequiredDb() {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Database unavailable.");
  }
  return db;
}

export async function checkRegistryStorage() {
  try {
    const db = getRequiredDb();
    await getDocs(query(collection(db, REFERENCES_COLLECTION), queryLimit(1)));
    return { ok: true };
  } catch (error) {
    console.warn("Firestore health check failed", error);
    return {
      ok: false,
      code: error?.code || "",
      message: error?.message || "Database unavailable.",
    };
  }
}

async function readCollection(collectionName, localKey, normalize, { limit, dedupe } = {}) {
  const localRecords = readLocal(localKey).map(normalize).sort(sortNewest);
  const db = getFirebaseDb();

  if (!db) {
    const records = dedupe ? dedupe(localRecords) : localRecords;
    return applyLimit(records, limit);
  }

  try {
    const constraints = [orderBy("createdAtMs", "desc")];
    if (typeof limit === "number" && !dedupe) constraints.push(queryLimit(limit));
    const snapshot = await getDocs(query(collection(db, collectionName), ...constraints));
    const rawRecords = snapshot.docs.map((item) => normalize({ id: item.id, ...item.data() }));
    const records = dedupe ? dedupe(rawRecords) : rawRecords;
    writeLocal(localKey, records);
    return applyLimit(records, limit);
  } catch (error) {
    console.warn(`Firestore read failed for ${collectionName}; using browser cache`, error);
    const records = dedupe ? dedupe(localRecords) : localRecords;
    return applyLimit(records, limit);
  }
}

async function writeCollectionRecord(collectionName, localKey, record, normalize) {
  const normalized = normalize(record);
  const db = getRequiredDb();

  await setDoc(doc(db, collectionName, normalized.id), normalized, { merge: true });

  const next = [
    normalized,
    ...readLocal(localKey)
      .map(normalize)
      .filter((item) => item.id !== normalized.id),
  ].sort(sortNewest);
  writeLocal(localKey, next);
  return normalized;
}

export async function listTrustedReferences({ limit } = {}) {
  return readCollection(REFERENCES_COLLECTION, REFERENCES_KEY, normalizeReference, {
    limit,
    dedupe: dedupeReferences,
  });
}

export async function getTrustedReference(id) {
  if (!id) return null;
  const references = await listTrustedReferences();
  return references.find((reference) => reference.id === id) || null;
}

export async function getLatestTrustedReference() {
  const [latest] = await listTrustedReferences({ limit: 1 });
  return latest || null;
}

export async function findTrustedReference(entry) {
  const sourceKey = buildSourceKey(entry);
  const referenceId = makeReferenceId(entry);
  const db = getFirebaseDb();

  if (db) {
    try {
      const snapshot = await getDoc(doc(db, REFERENCES_COLLECTION, referenceId));
      if (snapshot.exists()) {
        return normalizeReference({ id: snapshot.id, ...snapshot.data(), alreadyExists: true });
      }
    } catch (error) {
      console.warn("Firestore duplicate lookup failed", error);
    }
  }

  const references = await listTrustedReferences();
  const match = references.find((reference) => getReferenceSourceKey(reference) === sourceKey);
  return match ? { ...match, alreadyExists: true } : null;
}

export async function saveTrustedReference(entry) {
  const sourceKey = buildSourceKey(entry);
  const record = normalizeReference({
    id: entry.id || makeReferenceId(entry),
    sourceKey,
    schemaVersion: SCHEMA_VERSION,
    hashAlgorithm: "SHA-256",
    storageProvider: "firestore",
    version: entry.version || 1,
    ...entry,
  });
  return writeCollectionRecord(REFERENCES_COLLECTION, REFERENCES_KEY, record, normalizeReference);
}

export async function updateTrustedReference(id, updates) {
  const references = await listTrustedReferences();
  const current = references.find((reference) => reference.id === id);
  if (!current) return null;

  const record = normalizeReference({
    ...current,
    ...updates,
    id: current.id,
    createdAt: current.createdAt,
    createdAtMs: current.createdAtMs,
  });
  return writeCollectionRecord(REFERENCES_COLLECTION, REFERENCES_KEY, record, normalizeReference);
}

export async function listVerificationLogs({ limit } = {}) {
  return readCollection(LOGS_COLLECTION, VERIFICATION_LOGS_KEY, normalizeLog, { limit });
}

export async function saveVerificationLog(entry) {
  const record = normalizeLog({
    id: entry.id || makeId("log"),
    schemaVersion: SCHEMA_VERSION,
    hashAlgorithm: "SHA-256",
    storageProvider: "firestore",
    ...entry,
  });
  return writeCollectionRecord(LOGS_COLLECTION, VERIFICATION_LOGS_KEY, record, normalizeLog);
}
