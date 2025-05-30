import { useState } from "react";

const LoginModal = ({ onClose }) => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const userData = JSON.parse(localStorage.getItem("users") || "{}");
    const user = userData[id];

    if (!user || user.password !== password) {
      alert("❌ 로그인 실패: 아이디 또는 비밀번호가 잘못되었습니다.");
      return;
    }

    alert("✅ 로그인 성공!");
    // 로그인 후 페이지 이동 예시:
    setTimeout(() => {
      window.location.href = "/role";
    }, 1000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">🔐 로그인</h2>
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
          className="w-full p-3 mb-4 border rounded"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          로그인
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

export default LoginModal;
