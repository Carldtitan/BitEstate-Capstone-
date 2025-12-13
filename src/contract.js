import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import abi from "./abi.json" assert { type: "json" };

const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0x526A718547c8C2b0074f03cEAdC4B50E4577AD5b";
const RPC_URL =
  process.env.RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/5bu5nKW6A7oFXnWSE7Hky";

// Fixed price: 0.0000001 ETH in wei
export const PRICE_WEI = 100_000_000n;

let provider;
let signer;
let contract;
let readContract;

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
  throw new Error("No wallet or RPC URL configured");
}

async function getReadContract() {
  if (readContract) return readContract;
  if (!RPC_URL) throw new Error("No RPC_URL configured for read-only calls");
  const rp = new JsonRpcProvider(RPC_URL);
  readContract = new Contract(CONTRACT_ADDRESS, abi, rp);
  return readContract;
}

async function connectContract() {
  if (contract) return contract;
  provider = await getProvider();
  signer = provider.getSigner ? await provider.getSigner() : provider;
  contract = new Contract(CONTRACT_ADDRESS, abi, signer);
  return contract;
}

export async function getListing(id) {
  const c = await getReadContract();
  const l = await c.listings(id);
  return {
    owner: l.owner,
    priceWei: l.priceWei,
    sold: l.sold,
    exists: l.owner !== "0x0000000000000000000000000000000000000000",
  };
}

export async function isSold(listingId) {
  try {
    const c = await getReadContract();
    return Boolean(await c.isSold(listingId));
  } catch (err) {
    console.warn("isSold failed", err);
    return false;
  }
}

export async function purchaseListing(listingId, priceWei = PRICE_WEI) {
  const c = await connectContract();
  const tx = await c.purchase(listingId, { value: priceWei });
  const receipt = await tx.wait?.();
  return receipt?.hash || tx.hash;
}

export async function createListing(listingId, priceWei = PRICE_WEI) {
  const c = await connectContract();
  const tx = await c.createListing(listingId, priceWei);
  const receipt = await tx.wait?.();
  return receipt?.hash || tx.hash;
}

// Document hash functions (now on this contract)
export async function logHash(docHash) {
  const c = await connectContract();
  const tx = await c.registerDocumentHash(docHash);
  const receipt = await tx.wait?.();
  return receipt?.hash || tx.hash;
}

export async function verifyHash(docHash) {
  try {
    const c = await getReadContract();
    return Boolean(await c.isRegistered(docHash));
  } catch (err) {
    console.warn("verifyHash failed", err);
    return false;
  }
}
