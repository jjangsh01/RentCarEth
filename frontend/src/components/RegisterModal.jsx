import { useState } from "react";
import { ethers } from "ethers";

const RegisterModal = ({ onClose }) => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const handleFinalRegister = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const connectedAddress = await signer.getAddress();

      if (connectedAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        alert("⚠️ 입력한 지갑 주소와 MetaMask 지갑 주소가 일치하지 않습니다.");
        return;
      }

      // 사용자 데이터 불러오기
      const userData = JSON.parse(localStorage.getItem("users") || "{}");

      // 중복 아이디 검사
      if (userData[id]) {
        alert("❌ 이미 사용 중인 아이디입니다.");
        return;
      }

      // 중복 지갑 주소 검사
      const existingUser = Object.values(userData).find(
        (user) => user.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );

      if (existingUser) {
        alert("❌ 이미 등록된 지갑 주소입니다.");
        return;
      }

      // 회원 등록
      userData[id] = {
        password,
        walletAddress,
      };
      localStorage.setItem("users", JSON.stringify(userData));

      alert("🎉 회원가입이 완료되었습니다!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("❌ MetaMask 연결 실패:", err);
      alert("❌ MetaMask 연결에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">📝 회원가입</h2>
        <input
          type="text"
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full p-3 mb-3 border rounded"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-3 border rounded"
        />
        <input
          type="text"
          placeholder="MetaMask 지갑 주소"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />
        <button
          onClick={handleFinalRegister}
          className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
        >
          회원가입
        </button>
        <button
          onClick={onClose}
          className="mt-3 text-sm text-gray-500 hover:underline"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;
