import { ethers } from "ethers";
import { useState, useEffect } from "react";
import KYCManagerABI from "../abi/KYCManager.json";

export const useWeb3 = (triggerConnect = false) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [isKYCApproved, setIsKYCApproved] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!triggerConnect) return;

    const connect = async () => {
      setLoading(true);

      try {
        if (!window.ethereum) {
          console.error("🦊 MetaMask가 설치되어 있지 않습니다.");
          return;
        }

        const desiredChainId = "0xaa36a7"; // Sepolia
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

        if (currentChainId !== desiredChainId) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: desiredChainId }],
            });
            console.log("✅ Sepolia 네트워크로 전환됨");
          } catch (switchError) {
            if (switchError.code === 4902) {
              console.log("🌐 Sepolia 네트워크 추가 중...");
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: desiredChainId,
                    chainName: "Sepolia Testnet",
                    rpcUrls: ["https://rpc.sepolia.org"],
                    nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              });
            } else {
              throw switchError;
            }
          }
        }

        const kycAddress = import.meta.env.VITE_CONTRACT_KYC;
        const adminAddress = import.meta.env.VITE_ADMIN_ADDRESS?.toLowerCase();

        if (!kycAddress) {
          console.error("❌ KYC 컨트랙트 주소 없음");
          return;
        }

        const kycContract = new ethers.Contract(kycAddress, KYCManagerABI.abi, signer);
        const isAdmin = adminAddress && account.toLowerCase() === adminAddress;
        const kycStatus = await kycContract.checkKYC(account);

        setProvider(provider);
        setSigner(signer);
        setAccount(account);
        setIsAdmin(isAdmin);
        setIsKYCApproved(kycStatus);
      } catch (err) {
        console.error("❌ MetaMask 연결 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    connect();
  }, [triggerConnect]);

  return { provider, signer, account, isKYCApproved, isAdmin, loading };
};

export default useWeb3;




