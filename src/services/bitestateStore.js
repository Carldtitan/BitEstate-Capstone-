const REFERENCES_KEY = "bitestate_trusted_references_v1";
const VERIFICATION_LOGS_KEY = "bitestate_verification_logs_v1";

function readJson(key) {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn(`Could not read ${key}`, error);
    return [];
  }
}

function writeJson(key, value) {
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

function toTime(value) {
  if (!value) return 0;
  if (typeof value === "number") return value;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeReference(entry) {
  const createdAt = entry.createdAt || new Date().toISOString();
  const createdAtMs = entry.createdAtMs || toTime(createdAt) || Date.now();
  return {
    active: true,
    ...entry,
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

export async function listTrustedReferences({ limit } = {}) {
  const references = readJson(REFERENCES_KEY).map(normalizeReference).sort(sortNewest);
  return typeof limit === "number" ? references.slice(0, limit) : references;
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

export async function saveTrustedReference(entry) {
  const references = await listTrustedReferences();
  const record = normalizeReference({
    id: entry.id || makeId("ref"),
    version: entry.version || 1,
    ...entry,
  });
  const next = [record, ...references.filter((reference) => reference.id !== record.id)];
  writeJson(REFERENCES_KEY, next);
  return record;
}

export async function updateTrustedReference(id, updates) {
  const references = await listTrustedReferences();
  const next = references.map((reference) =>
    reference.id === id
      ? normalizeReference({
          ...reference,
          ...updates,
          id: reference.id,
          createdAt: reference.createdAt,
          createdAtMs: reference.createdAtMs,
        })
      : reference
  );
  writeJson(REFERENCES_KEY, next);
  return next.find((reference) => reference.id === id) || null;
}

export async function listVerificationLogs({ limit } = {}) {
  const logs = readJson(VERIFICATION_LOGS_KEY).map(normalizeLog).sort(sortNewest);
  return typeof limit === "number" ? logs.slice(0, limit) : logs;
}

export async function saveVerificationLog(entry) {
  const logs = await listVerificationLogs();
  const record = normalizeLog({
    id: entry.id || makeId("log"),
    ...entry,
  });
  const next = [record, ...logs.filter((log) => log.id !== record.id)];
  writeJson(VERIFICATION_LOGS_KEY, next);
  return record;
}
