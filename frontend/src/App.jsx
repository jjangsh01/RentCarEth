import React, { useState } from "react";
import AddCarForm from "./components/AddCarForm";
import AdminCarManagement from "./components/AdminCarManagement";
import CarList from "./components/CarList";
import useManualWeb3 from "./hooks/useManualWeb3";
import useWeb3 from "./hooks/useWeb3";
import KYCStatusLite from "./components/KYCStatusLite";
import KYCRequestMetaMask from "./components/KYCRequestMetaMask";

function App() {
  const [inputAddress, setInputAddress] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [connectWithMetaMask, setConnectWithMetaMask] = useState(false);

  const {
    isKYCApproved,
    isAdmin,
    validAddress,
    loading,
  } = useManualWeb3(inputAddress, confirmed);

  const {
    signer,
    account,
    isKYCApproved: metaKYC,
    isAdmin: metaAdmin,
    loading: loadingMeta,
  } = useWeb3(connectWithMetaMask);

  // 지갑 입력 전
  if (!confirmed) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h1>🚗 Web3 렌트카 시스템</h1>
        <p>🧾 지갑 주소를 입력하고 확인을 누르세요</p>
        <input
          placeholder="0x..."
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          style={{ padding: "8px", width: "300px" }}
        />
        <br />
        <button onClick={() => setConfirmed(true)} style={{ marginTop: "10px" }}>
          ✅ 주소 확인
        </button>
      </div>
    );
  }

  if (loading) return <p>⏳ 주소 확인 중...</p>;

  if (!validAddress) {
    return (
      <div>
        <p>❌ 유효하지 않은 지갑 주소입니다.</p>
        <button onClick={() => setConfirmed(false)}>🔙 돌아가기</button>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div>
        <h1>👑 관리자 화면</h1>
        <p>🧾 주소: {inputAddress}</p>
        <p>⚠️ MetaMask 연결 시에만 등록/삭제 동작 가능</p>
        <AddCarForm signer={signer} />
        <AdminCarManagement signer={signer} />
      </div>
    );
  }

  if (!isKYCApproved && !connectWithMetaMask) {
    return (
      <div>
        <h2>🔒 KYC 미인증 사용자</h2>
        <p>주소: {inputAddress}</p>
        <KYCStatusLite onMetaMaskConnect={() => setConnectWithMetaMask(true)} />
        <button onClick={() => setConfirmed(false)}>🔙 다른 주소 입력</button>
      </div>
    );
  }

  // MetaMask 연결 후 KYC 처리
  if (connectWithMetaMask && !metaKYC) {
    return (
      <div>
        <h2>🦊 MetaMask 연결됨</h2>
        <p>지갑 주소: {account}</p>
        <KYCRequestMetaMask signer={signer} account={account} />
      </div>
    );
  }

  return (
    <div>
      <h1>🚘 렌트카 사용자 화면</h1>
      <p>🧾 주소: {inputAddress}</p>
      <CarList signer={signer} />
    </div>
  );
}

export default App;











