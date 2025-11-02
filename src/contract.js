import { BrowserProvider, Contract } from "ethers";
import abi from "./abi.json" assert { type: "json" };

// mock contract address
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

let provider;
let signer;
let contract;

async function connectContract() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }

  // ✅ correct way for ethers v6
  provider = new BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new Contract(CONTRACT_ADDRESS, abi, signer);
  return contract;
}

export async function logHash(docHash) {
  const c = contract || (await connectContract());
  console.log("Simulated log to blockchain:", docHash);
  return "0xMockTransactionHash";
}

export async function verifyHash(docHash) {
  const c = contract || (await connectContract());
  console.log("Verifying hash:", docHash);
  const mockExists = Math.random() > 0.5;
  return mockExists;
}
