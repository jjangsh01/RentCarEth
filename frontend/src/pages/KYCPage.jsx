// src/pages/KYCPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import KYCManagerABI from "../abi/KYCManager.json";

const KYCPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const address = location.state?.address;
  const [signer, setSigner] = useState(null);
  const [msg, setMsg] = useState("");
  const [connectedAddr, setConnectedAddr] = useState("");

  useEffect(() => {
    const connectMetaMask = async () => {
      if (!window.ethereum) {
        setMsg("❌ MetaMask가 설치되어 있지 않습니다.");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const connected = await signer.getAddress();

        setSigner(signer);
        setConnectedAddr(connected);
      } catch (err) {
        console.error("❌ MetaMask 연결 실패:", err);
        setMsg("❌ MetaMask 연결 실패");
      }
    };

    connectMetaMask();
  }, []);

  const handleKYC = async () => {
    if (!signer) return;

    try {
      if (connectedAddr.toLowerCase() !== address.toLowerCase()) {
        alert("⚠️ 현재 MetaMask 연결 주소와 입력한 주소가 다릅니다.");
        return;
      }

      setMsg("⏳ KYC 인증 요청 중...");
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_KYC,
        KYCManagerABI.abi,
        signer
      );
      const tx = await contract.requestKYC();
      await tx.wait();
      setMsg("✅ KYC 요청 완료! 관리자의 승인을 기다려 주세요.");

      // 1초 후 role 페이지 이동
      setTimeout(() => {
        navigate("/role", { state: { address } });
      }, 1000);
    } catch (err) {
      console.error("❌ KYC 요청 실패:", err);
      setMsg(`❌ ${err.reason || err.message}`);
    }
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 w-full max-w-lg">
        {/* Header with logo */}
        <div className="text-center mb-8 animate-fade-in-up">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            KYC 인증
            </h1>
            <p className="text-lg text-purple-200 font-medium">
            신원 확인을 위한 인증 절차
            </p>
        </div>

        {/* Main KYC Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl animate-fade-in-up transform hover:scale-[1.01] transition-all duration-300">
            {/* Address Info Section */}
            <div className="space-y-4 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-lg">👤</span>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm">요청 지갑 주소</h3>
                    <p className="text-purple-200 text-xs">인증을 요청한 지갑</p>
                </div>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <p className="font-mono text-sm text-white break-all">{address}</p>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-lg">🦊</span>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm">연결된 MetaMask</h3>
                    <p className="text-purple-200 text-xs">현재 연결된 지갑</p>
                </div>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <p className="font-mono text-sm text-white break-all">
                    {connectedAddr || "연결 중..."}
                </p>
                </div>
            </div>

            {/* Address Match Status */}
            {connectedAddr && (
                <div className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border ${
                connectedAddr.toLowerCase() === address.toLowerCase() 
                    ? "bg-green-500/10 border-green-400/30 text-green-400" 
                    : "bg-red-500/10 border-red-400/30 text-red-400"
                }`}>
                <span className="text-lg">
                    {connectedAddr.toLowerCase() === address.toLowerCase() ? "✅" : "⚠️"}
                </span>
                <span className="font-medium text-sm">
                    {connectedAddr.toLowerCase() === address.toLowerCase() 
                    ? "지갑 주소가 일치합니다" 
                    : "지갑 주소가 일치하지 않습니다"}
                </span>
                </div>
            )}
            </div>

            {/* KYC Request Section */}
            <div className="space-y-6">
            <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-6 mb-6">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-white font-bold text-lg mb-2">KYC 인증 절차</h3>
                <p className="text-yellow-200 text-sm leading-relaxed">
                    신원 확인을 위해 블록체인에 KYC 요청을 전송합니다.<br/>
                    관리자 승인 후 서비스를 이용하실 수 있습니다.
                </p>
                </div>
            </div>

            <button
                onClick={handleKYC}
                disabled={!signer || (connectedAddr && connectedAddr.toLowerCase() !== address.toLowerCase())}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-2xl transform hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-2xl disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3">
                <span className="text-xl">📨</span>
                <span>KYC 인증 요청 전송</span>
                {!signer && <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>}
                </div>
            </button>

            {/* Status Message */}
            {msg && (
                <div className="animate-fade-in-up">
                <div className={`p-4 rounded-2xl border text-center ${
                    msg.includes("✅") 
                    ? "bg-green-500/10 border-green-400/30 text-green-400" 
                    : msg.includes("❌") 
                    ? "bg-red-500/10 border-red-400/30 text-red-400"
                    : msg.includes("⏳")
                    ? "bg-blue-500/10 border-blue-400/30 text-blue-400"
                    : "bg-yellow-500/10 border-yellow-400/30 text-yellow-400"
                }`}>
                    <p className="font-medium">{msg}</p>
                    {msg.includes("⏳") && (
                    <div className="mt-3">
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-full animate-spin">
                        <div className="w-6 h-6 bg-blue-400/20 rounded-full"></div>
                        </div>
                    </div>
                    )}
                    {msg.includes("✅") && (
                    <div className="mt-2 text-sm text-green-300">
                        잠시 후 역할 선택 페이지로 이동합니다...
                    </div>
                    )}
                </div>
                </div>
            )}
            </div>

            {/* Footer info */}
            <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="text-purple-200">
                <div className="text-2xl mb-1">🔒</div>
                <div className="text-xs font-medium">안전한 인증</div>
                </div>
                <div className="text-purple-200">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs font-medium">빠른 승인</div>
                </div>
            </div>
            <div className="text-center mt-4">
                <p className="text-purple-300 text-xs">
                블록체인 기반 투명한 신원 인증 시스템
                </p>
            </div>
            </div>
        </div>

        {/* Navigation hint */}
        <div className="text-center mt-6 animate-fade-in-up">
            <p className="text-purple-300 text-sm">
            🔄 MetaMask 지갑이 연결되지 않은 경우 브라우저를 새로고침해 주세요
            </p>
        </div>
        </div>

        <style jsx>{`
        .animation-delay-2000 {
            animation-delay: 2s;
        }
        .animation-delay-4000 {
            animation-delay: 4s;
        }
        @keyframes fade-in-up {
            from {
            opacity: 0;
            transform: translateY(30px);
            }
            to {
            opacity: 1;
            transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
        }
        `}</style>
    </div>
    );
};

export default KYCPage;

