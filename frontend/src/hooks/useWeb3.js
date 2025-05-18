// src/hooks/useWeb3.js
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import KYCManagerABI from "../abi/KYCManager.json";

export const useWeb3 = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [isKYCApproved, setIsKYCApproved] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const connect = async () => {
      if (!window.ethereum) {
        console.error("🦊 MetaMask가 설치되어 있지 않습니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 🌐 Sepolia 네트워크 ID
        const desiredChainId = "0xaa36a7";  // 11155111 in hexadecimal
        const provider = new ethers.BrowserProvider(window.ethereum);

        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

        // 💡 네트워크 전환 로직
        if (currentChainId !== desiredChainId) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: desiredChainId }],
            });
            console.log("✅ MetaMask를 Sepolia 네트워크로 전환했습니다.");
          } catch (switchError) {
            if (switchError.code === 4902) {
              console.log("🌐 Sepolia 네트워크 추가 중...");
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: desiredChainId,
                    chainName: "Sepolia Testnet",
                    rpcUrls: ["https://rpc.sepolia.org", "https://eth-sepolia.g.alchemy.com/v2/6A7jyQiN_4VKxzV9ce_DjheXPMKhtsUy"],
                    nativeCurrency: {
                      name: "SepoliaETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              });
              console.log("✅ Sepolia 네트워크를 MetaMask에 추가했습니다.");
            } else {
              console.error("❌ 네트워크 전환 실패:", switchError);
              setLoading(false);
              return;
            }
          }
        }

        // 💼 KYC 계약 설정
        const kycContractAddress = import.meta.env.VITE_CONTRACT_KYC;
        if (!kycContractAddress) {
          console.error("❌ KYC 컨트랙트 주소가 설정되지 않았습니다.");
          setLoading(false);
          return;
        }

        const kycContract = new ethers.Contract(kycContractAddress, KYCManagerABI.abi, signer);
        console.log("📝 KYC 컨트랙트 주소:", kycContractAddress);

        // 🌟 관리자 주소 확인 (환경 변수에서 가져오기)
        const adminAddress = import.meta.env.VITE_ADMIN_ADDRESS?.toLowerCase();
        const isAdmin = adminAddress && account.toLowerCase() === adminAddress;

        // ✅ 관리자 여부 로그
        console.log("👤 현재 계정:", account.toLowerCase());
        console.log("👑 관리자 계정:", adminAddress);
        console.log("🔑 관리자 여부:", isAdmin);

        // 🌟 KYC 상태 확인
        let kycStatus = false;
        try {
          const result = await kycContract.checkKYC(account);
          kycStatus = result;
          console.log("✅ KYC 상태:", kycStatus);
        } catch (kycError) {
          console.error("❌ KYC 상태 확인 오류:", kycError);
        }

        setProvider(provider);
        setSigner(signer);
        setAccount(account);
        setIsAdmin(isAdmin);
        setIsKYCApproved(kycStatus);
      } catch (error) {
        console.error("🛑 MetaMask 연결 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    connect();
  }, []);

  return { provider, signer, account, isKYCApproved, isAdmin, loading };
};

export default useWeb3;




