// src/components/ KYCStatusLite.jsx
const KYCStatusLite = ({ onMetaMaskConnect }) => {
  return (
    <div>
      <p>❌ 현재 KYC 인증이 되지 않았습니다.</p>
      <p>🔐 KYC를 신청하려면 MetaMask를 연결하세요.</p>
      <button onClick={onMetaMaskConnect}>🦊 MetaMask로 인증 요청</button>
    </div>
  );
};

export default KYCStatusLite;
