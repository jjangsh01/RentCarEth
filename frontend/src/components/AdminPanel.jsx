// src/components/AdminPanel.jsx
import { useState } from "react";
import { ethers } from "ethers";
import KYCManagerABI from "../abi/KYCManager.json";

const AdminKYCPanel = ({ signer }) => {
  const [userAddress, setUserAddress] = useState("");
  const [txStatus, setTxStatus] = useState("");

  const contract = new ethers.Contract(
    import.meta.env.VITE_CONTRACT_KYC,
    KYCManagerABI.abi,
    signer
  );

  const approveKYC = async () => {
    try {
      const tx = await contract.approveKYC(userAddress);
      await tx.wait();
      setTxStatus(`✅ ${userAddress} 인증 완료`);
    } catch (e) {
      setTxStatus(`❌ 승인 실패: ${e.message}`);
    }
  };

  return (
    <div>
      <h2>🛠️ 관리자 - KYC 승인</h2>
      <input
        placeholder="사용자 지갑 주소"
        value={userAddress}
        onChange={(e) => setUserAddress(e.target.value)}
      />
      <button onClick={approveKYC}>KYC 승인</button>
      <p>{txStatus}</p>
    </div>
  );
};

export default AdminKYCPanel;


