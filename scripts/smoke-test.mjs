import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), "utf8"));
}

const requiredFiles = [
  "index.html",
  ".firebaserc",
  "firebase.json",
  "firestore.rules",
  "src/App.jsx",
  "src/services/firebaseClient.js",
  "src/services/bitestateStore.js",
  "src/components/HomePage.jsx",
  "src/components/VerifyPage.jsx",
  "src/components/UploadPage.jsx",
  "public/brand/real-estate-documents.jpg",
  "public/brand/modern-home.jpg",
];

for (const file of requiredFiles) {
  assert(existsSync(resolve(root, file)), `Missing required file: ${file}`);
}

const abi = readJson("src/abi.json");
const functionNames = new Set(abi.filter((item) => item.type === "function").map((item) => item.name));

assert(functionNames.has("registerDocumentHash"), "Contract ABI is missing registerDocumentHash");
assert(functionNames.has("isRegistered"), "Contract ABI is missing isRegistered");

const packageJson = readJson("package.json");
assert(packageJson.scripts?.build, "Missing build script");
assert(packageJson.scripts?.start, "Missing start script");

console.log("Smoke test passed.");
