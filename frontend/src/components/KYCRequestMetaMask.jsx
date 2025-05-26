// src/components/KYCRequestMetaMask.jsx
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import KYCManagerABI from "../abi/KYCManager.json";

const KYCRequestMetaMask = ({ signer, account, onKYCComplete }) => {
  const [msg, setMsg] = useState("");

  const contract = new ethers.Contract(
    import.meta.env.VITE_CONTRACT_KYC,
    KYCManagerABI.abi,
    signer
  );

  const requestKYC = async () => {
    try {
      setMsg("⏳ KYC 요청 중...");
      const tx = await contract.requestKYC();
      await tx.wait();
      setMsg("✅ KYC 요청 완료! 곧 승인될 수 있습니다.");

      // ✅ 상태 재확인
      const result = await contract.checkKYC(account);
      if (result) {
        console.log("✅ KYC 승인됨");
        if (onKYCComplete) onKYCComplete(); // ⬅️ App에 반영
      } else {
        console.warn("❌ KYC 상태가 false로 반환됨");
      }
    } catch (err) {
      console.error("❌ 요청 실패:", err);
      setMsg("❌ 요청 실패: " + (err.reason || err.message));
    }
  };

  return (
    <div>
      <h3>📜 KYC 신청</h3>
      <p>연결된 주소: {account}</p>
      <button onClick={requestKYC}>📨 KYC 인증 요청</button>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default KYCRequestMetaMask;
