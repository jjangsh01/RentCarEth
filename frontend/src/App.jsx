// /src/App.jsx
import React from "react";
import AddCarForm from "./components/AddCarForm";
import AdminCarManagement from "./components/AdminCarManagement";
import useWeb3 from "./hooks/useWeb3.js";
import KYCStatus from "./components/KYCStatus.jsx";
import CarList from "./components/CarList.jsx";

function App() {
  const { signer, account, isKYCApproved, isAdmin, loading } = useWeb3();

  if (loading) return <p>⏳ MetaMask 연결 중...</p>;
  if (!signer) return <p>🦊 MetaMask를 연결하세요</p>;

  return (
    <div>
      <h1>🚗 Web3 렌트카 시스템</h1>
      <p>🧾 지갑 주소: {account}</p>

      <KYCStatus signer={signer} account={account} />
      <CarList signer={signer} />

      {isAdmin && (
        <>
          <h2>👑 관리자 전용</h2>
          <AddCarForm signer={signer} account={account} />
          <AdminCarManagement signer={signer} />
        </>
      )}
    </div>
  );
}

export default App;









