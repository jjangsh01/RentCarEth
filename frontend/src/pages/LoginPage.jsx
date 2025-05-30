import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const matchedUser = users.find(
      (user) => user.id === id && user.password === password
    );

    if (!matchedUser) {
      alert("❌ 아이디 또는 비밀번호가 일치하지 않습니다.");
      return;
    }

    // 로그인된 사용자 저장
    localStorage.setItem("currentUser", JSON.stringify(matchedUser));
    alert("✅ 로그인 성공!");

    // 1초 후 /role로 이동, 지갑 주소 전달
    setTimeout(() => {
      navigate("/role", { state: { address: matchedUser.walletAddress } });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-3xl font-bold text-center">로그인</h2>
        <input
          type="text"
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:outline-none"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:outline-none"
        />
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold"
        >
          로그인
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
