// src/context/Web3Context.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import KYCManagerABI from "../abi/KYCManager.json";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [isKYCApproved, setIsKYCApproved] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  

  const desiredChainId = "0xaa36a7"; // Sepolia

  const disconnect = () => {
    setSigner(null);
    setAccount(null);
    setIsKYCApproved(false);
    setIsAdmin(false);
    setProvider(null);
    setLoading(false);
  };

  // 📌 지갑 연결 함수 (useCallback 제거)
  const connect = async () => {
    try {
      if (!window.ethereum) {
        console.warn("🦊 MetaMask 미설치");
        return;
      }

      const _provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const _signer = await _provider.getSigner();
      const _account = await _signer.getAddress();

      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
      if (currentChainId !== desiredChainId) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: desiredChainId }],
        });
      }

      const kycContract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_KYC,
        KYCManagerABI.abi,
        _signer
      );

      const status = await kycContract.checkKYC(_account);
      const adminAddress = import.meta.env.VITE_ADMIN_ADDRESS?.toLowerCase();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);
      setIsKYCApproved(status);
      setIsAdmin(_account.toLowerCase() === adminAddress);
    } catch (error) {
      console.error("❌ 지갑 연결 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 최초 앱 진입 시 자동 연결
  useEffect(() => {
    connect();
  }, []);

  // 계정 변경 감지
  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
        setIsKYCApproved(false);
        setIsAdmin(false);
        console.warn("❌ 계정 없음 (지갑 해제됨)");
      } else {
        console.log("🔄 계정 변경됨:", accounts[0]);
        setLoading(true);
        await connect();
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        isKYCApproved,
        isAdmin,
        loading,
        disconnect,
        connect,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);

