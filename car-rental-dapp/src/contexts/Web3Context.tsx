import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

type Web3ContextType = {
  provider: ethers.providers.Web3Provider | null;
  account: string | null;
  connectWallet: () => Promise<void>;
};

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await ethProvider.send("eth_requestAccounts", []);
      setProvider(ethProvider);
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      connectWallet();
    }
  }, []);

  return (
    <Web3Context.Provider value={{ provider, account, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error("useWeb3 must be used within Web3Provider");
  return context;
};
