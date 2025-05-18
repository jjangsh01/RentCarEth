// src/components/KYCStatus.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import KYCManagerABI from "../abi/KYCManager.json";

const KYCStatus = ({ signer, account }) => {
  const [isApproved, setIsApproved] = useState(false);
  const [msg, setMsg] = useState("");

  const contract = new ethers.Contract(
    import.meta.env.VITE_CONTRACT_KYC,
    KYCManagerABI.abi,
    signer
  );

  useEffect(() => {
    const check = async () => {
      try {
        const status = await contract.checkKYC(account);
        setIsApproved(status);
        console.log("✅ KYC 상태 확인:", status);
      } catch (error) {
        console.error("❌ KYC 상태 확인 오류:", error);
        setMsg("KYC 상태 확인 실패: " + (error.reason || error.message));
      }
    };
    check();
  }, [account]);

  // ✅ KYC 신청 함수
  const requestKYC = async () => {
    try {
      setMsg("⏳ KYC 신청 중...");
      const tx = await contract.requestKYC();
      await tx.wait();
      setIsApproved(true);
      setMsg("✅ KYC 신청 완료");
    } catch (error) {
      console.error("❌ KYC 신청 실패:", error);
      setMsg("KYC 신청 실패: " + (error.reason || error.message));
    }
  };

  return (
    <div>
      <h2>🔍 KYC 인증 상태</h2>
      {isApproved ? (
        <p>✅ 인증됨 – 차량 대여 가능</p>
      ) : (
        <>
          <p>❌ 미인증 – KYC 신청 필요</p>
          <button onClick={requestKYC}>KYC 신청</button>
        </>
      )}
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default KYCStatus;

