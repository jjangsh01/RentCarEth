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
      if (window.ethereum) {
        try {
          setLoading(true);

          const provider = new ethers.BrowserProvider(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const signer = await provider.getSigner();
          const account = await signer.getAddress();

          // 🌐 Sepolia 네트워크 ID
          const desiredChainId = "0xaa36a7";  // 11155111 in hexadecimal
          const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

          // 네트워크가 Sepolia가 아닌 경우 전환
          if (currentChainId !== desiredChainId) {
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: desiredChainId }],
              });
              console.log("✅ MetaMask를 Sepolia 네트워크로 전환했습니다.");
            } catch (switchError) {
              // 네트워크가 존재하지 않을 때 추가
              if (switchError.code === 4902) {
                console.log("🌐 Sepolia 네트워크 추가 중...");
                try {
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
                } catch (addError) {
                  console.error("❌ 네트워크 추가 실패:", addError);
                  return;
                }
              } else {
                console.error("❌ 네트워크 전환 실패:", switchError);
                return;
              }
            }
          }

          const kycContractAddress = import.meta.env.VITE_CONTRACT_KYC;
          const adminAddress = import.meta.env.VITE_ADMIN_ADDRESS?.toLowerCase();

          // 환경 변수 검증
          if (!kycContractAddress || kycContractAddress === "undefined") {
            console.error("❌ KYC 컨트랙트 주소가 설정되지 않았습니다. .env 파일을 확인하세요.");
            setLoading(false);
            return;
          }

          console.log("📝 KYC 컨트랙트 주소:", kycContractAddress);

          const kycContract = new ethers.Contract(
            kycContractAddress,
            KYCManagerABI.abi,
            signer
          );

          try {
            // 직접 호출 방식으로 변경
            const callData = kycContract.interface.encodeFunctionData("checkKYC", [account]);
            
            // 로우 레벨 호출 사용
            const result = await provider.call({
              to: kycContractAddress,
              data: callData
            });
            
            // 결과가 비어있는지 확인
            if (result === "0x") {
              console.log("⚠️ 컨트랙트가 빈 응답 반환, KYC 미인증으로 처리");
              setIsKYCApproved(false);
            } else {
              // 결과 디코딩 시도
              try {
                const decodedResult = kycContract.interface.decodeFunctionResult("checkKYC", result);
                setIsKYCApproved(decodedResult[0]);
                console.log("✅ KYC 상태:", decodedResult[0]);
              } catch (decodeError) {
                console.error("❌ 결과 디코딩 실패:", decodeError);
                setIsKYCApproved(false);
              }
            }
          } catch (kycError) {
            console.error("❌ KYC 상태 확인 오류:", kycError);
            setIsKYCApproved(false);
          }

          // 컨트랙트 코드가 실제로 배포되어 있는지 확인
          try {
            const contractCode = await provider.getCode(kycContractAddress);
            if (contractCode === "0x") {
              console.error("❌ 해당 주소에 컨트랙트가 배포되어 있지 않습니다:", kycContractAddress);
            } else {
              console.log("✅ 컨트랙트 코드 확인됨");
            }
          } catch (codeError) {
            console.error("❌ 컨트랙트 코드 확인 실패:", codeError);
          }

          setProvider(provider);
          setSigner(signer);
          setAccount(account);
          setIsAdmin(adminAddress && account.toLowerCase() === adminAddress);
          
          if (adminAddress) {
            console.log("👤 현재 계정:", account.toLowerCase());
            console.log("👑 관리자 계정:", adminAddress);
            console.log("🔑 관리자 여부:", account.toLowerCase() === adminAddress);
          } else {
            console.warn("⚠️ 관리자 주소가 설정되지 않았습니다. .env 파일을 확인하세요.");
          }
          
        } catch (error) {
          console.error("🛑 MetaMask 연결 실패:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.error("🦊 MetaMask가 설치되어 있지 않습니다.");
        setLoading(false);
      }
    };
    connect();
  }, []);

  return { provider, signer, account, isKYCApproved, isAdmin, loading };
};

export default useWeb3;



