import { ethers } from "ethers";
import abi from "./abi.json"; // simple contract ABI file

const CONTRACT_ADDRESS = "0xYourContractAddressHere";

let provider;
let signer;
let contract;

async function connectContract() {
  if (!window.ethereum) throw new Error("Install MetaMask");
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  return contract;
}

export async function logHash(docHash) {
  const c = contract || (await connectContract());
  const tx = await c.logDocument(docHash);
  await tx.wait();
  return tx.hash;
}

export async function verifyHash(docHash) {
  const c = contract || (await connectContract());
  return await c.documentExists(docHash);
}
