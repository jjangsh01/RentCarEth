// src/hooks/useManualWeb3.js
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import KYCManagerABI from "../abi/KYCManager.json";

const useManualWeb3 = (inputAddress, trigger) => {
  const [isKYCApproved, setIsKYCApproved] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [validAddress, setValidAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trigger || !ethers.isAddress(inputAddress)) {
      setValidAddress(false);
      return;
    }
    
    const check = async () => {
      setLoading(true);
      try {
        const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_SEPOLIA_RPC);
        const contract = new ethers.Contract(
          import.meta.env.VITE_CONTRACT_KYC,
          KYCManagerABI.abi,
          provider
        );

        const result = await contract.checkKYC(inputAddress);
        setIsKYCApproved(result);

        const admin = import.meta.env.VITE_ADMIN_ADDRESS?.toLowerCase();
        setIsAdmin(admin === inputAddress.toLowerCase());

        setValidAddress(true);
      } catch (err) {
        console.error("❌ 조회 실패:", err);
        setValidAddress(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [inputAddress, trigger]);

  return { isKYCApproved, isAdmin, validAddress, loading };
};

export default useManualWeb3;   
