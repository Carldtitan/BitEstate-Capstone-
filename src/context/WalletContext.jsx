import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const WalletContext = createContext();
const TARGET_CHAIN_ID = "0xaa36a7";

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState(null);
  const [chainId, setChainId] = useState("");
  const [networkOk, setNetworkOk] = useState(true);
  const [walletError, setWalletError] = useState("");

  const disconnectWallet = () => {
    setWalletAddress(null);
    setChainId("");
    setNetworkOk(true);
    setWalletError("");
  };

  useEffect(() => {
    if (!user) {
      disconnectWallet();
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return undefined;

    const syncChain = async (nextAddress = null) => {
      try {
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        setChainId(currentChainId);
        setNetworkOk(currentChainId === TARGET_CHAIN_ID);
        if (nextAddress !== null) {
          setWalletAddress(nextAddress);
        }
      } catch (error) {
        console.warn("Could not read chain id", error);
      }
    };

    const handleAccountsChanged = (accounts) => {
      const nextAddress = accounts?.[0] || null;
      setWalletAddress(nextAddress);
      if (!nextAddress) {
        setWalletError("");
        return;
      }
      syncChain(nextAddress);
    };

    const handleChainChanged = (nextChainId) => {
      setChainId(nextChainId);
      setNetworkOk(nextChainId === TARGET_CHAIN_ID);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

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
      const address = accounts[0] || null;
      setWalletAddress(address);
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(currentChainId);
      setNetworkOk(currentChainId === TARGET_CHAIN_ID);
      return address;
    } catch (error) {
      console.warn("Failed to connect wallet", error);
      setWalletError(error?.message || "Failed to connect to MetaMask.");
      setWalletAddress(null);
      return null;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        chainId,
        networkOk,
        walletError,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
