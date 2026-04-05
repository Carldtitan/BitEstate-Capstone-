import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import abi from "./abi.json" assert { type: "json" };

const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0x526A718547c8C2b0074f03cEAdC4B50E4577AD5b";
const RPC_URL =
  process.env.RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/5bu5nKW6A7oFXnWSE7Hky";

function hasWallet() {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

async function getProvider() {
  if (hasWallet()) {
    return new BrowserProvider(window.ethereum);
  }
  if (RPC_URL) {
    return new JsonRpcProvider(RPC_URL);
  }
  return null;
}

async function connectContract() {
  if (!hasWallet()) throw new Error("Wallet required to register document hashes");
  const provider = await getProvider();
  if (!provider) throw new Error("No wallet or RPC URL configured");
  const signer = provider.getSigner ? await provider.getSigner() : provider;
  return new Contract(CONTRACT_ADDRESS, abi, signer);
}

async function getReadContract() {
  const provider = await getProvider();
  if (!provider) return null;
  return new Contract(CONTRACT_ADDRESS, abi, provider);
}

export async function logHash(docHash) {
  const c = await connectContract();
  const tx = await c.registerDocumentHash(docHash);
  const receipt = await tx.wait?.();
  return receipt?.hash || tx.hash;
}

export async function verifyHash(docHash) {
  try {
    const c = await getReadContract();
    if (!c) return null;
    return Boolean(await c.isRegistered(docHash));
  } catch (err) {
    console.warn("verifyHash failed", err);
    return null;
  }
}
