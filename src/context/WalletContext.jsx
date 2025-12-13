import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { BrowserProvider, formatEther } from "ethers";

const WalletContext = createContext();

const STORAGE_KEY = "bitestate_wallet_v1";
const COWRIES_PER_ETH = 200000; // 10,000 Cowries = 0.05 ETH -> 200,000 per ETH

function loadWallets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("Could not load wallets", err);
    return {};
  }
}

function saveWallets(wallets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
  } catch (err) {
    console.warn("Could not persist wallets", err);
  }
}

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [wallets, setWallets] = useState({});
  const [balance, setBalance] = useState(0);
  const [owned, setOwned] = useState({});
  const [walletAddress, setWalletAddress] = useState(null);
  const [networkOk, setNetworkOk] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [ethBalance, setEthBalance] = useState("0");

  useEffect(() => {
    setWallets(loadWallets());
  }, []);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      setOwned({});
      setWalletAddress(null);
      setEthBalance("0");
      return;
    }
    const existing = wallets[user.uid];
    if (existing) {
      setBalance(existing.balance || 0);
      setOwned(existing.owned || {});
      return;
    }
    const next = { ...wallets, [user.uid]: { balance: 0, owned: {} } };
    setWallets(next);
    setBalance(0);
    setOwned({});
    saveWallets(next);
  }, [user, wallets]);

  const updateWallet = (nextWallet) => {
    if (!user) return;
    const next = { ...wallets, [user.uid]: nextWallet };
    setWallets(next);
    saveWallets(next);
  };

  const canAfford = (price) => balance >= price;

  const purchase = (listing) => {
    if (!user) throw new Error("Login required to purchase");
    if (!canAfford(listing.cowries)) throw new Error("Insufficient Cowries");
    const newBalance = balance - listing.cowries;
    const nextOwned = { ...owned, [listing.id]: listing };
    setBalance(newBalance);
    setOwned(nextOwned);
    updateWallet({ balance: newBalance, owned: nextOwned });
  };

  const refreshWalletBalance = async (address) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const wei = await provider.getBalance(address);
      const eth = parseFloat(formatEther(wei));
      const cowries = Math.floor(eth * COWRIES_PER_ETH);
      setEthBalance(eth.toFixed(6));
      setBalance(cowries);
      updateWallet({ balance: cowries, owned });
    } catch (err) {
      console.warn("Could not refresh wallet balance", err);
      setEthBalance("0");
      setBalance(0);
    }
  };

  const connectWallet = async () => {
    if (!user) {
      setWalletError("Please log in first.");
      return null;
    }
    if (typeof window === "undefined" || !window.ethereum) {
      const msg = "Wallet not found. Please install MetaMask.";
      console.warn(msg);
      setWalletError(msg);
      setWalletAddress(null);
      return null;
    }
    try {
      setWalletError("");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      setWalletAddress(address);
      refreshWalletBalance(address);
      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        setNetworkOk(chainId === "0xaa36a7"); // Sepolia
      } catch (err) {
        console.warn("Could not read chain id", err);
        setNetworkOk(true);
      }
      window.ethereum.on("chainChanged", (cid) => {
        setNetworkOk(cid === "0xaa36a7");
      });
      window.ethereum.on("accountsChanged", (accs) => {
        const nextAddr = accs[0] || null;
        setWalletAddress(nextAddr);
        if (nextAddr) refreshWalletBalance(nextAddr);
      });
      return address;
    } catch (err) {
      console.warn("Failed to connect wallet", err);
      setWalletError(err?.message || "Failed to connect to MetaMask.");
      setWalletAddress(null);
      return null;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        ethBalance,
        owned,
        purchase,
        canAfford,
        walletAddress,
        networkOk,
        walletError,
        connectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
