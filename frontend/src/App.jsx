// /src/App.jsx
import AddCarForm from "./components/AddCarForm";
import useWeb3 from "./hooks/web3.js";
import KYCStatus from "./components/KYCStatus.jsx";
import CarList from "./components/CarList.jsx";
import RentForm from "./components/RentForm.jsx";
import AdminKYCPanel from "./components/AdminPanel.jsx";

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

      {isKYCApproved ? (
        <RentForm signer={signer} />
      ) : (
        <p>❗ KYC 인증 후 차량 대여가 가능합니다.</p>
      )}

      {isAdmin && (
        <>
          <AdminKYCPanel signer={signer} />
          <AddCarForm signer={signer} account={account} />
        </>
      )}
    </div>
  );
}

export default App;





