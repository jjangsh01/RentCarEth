// pages/RenterPage.jsx
// 렌트 및 반납 페이지 
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import CarList from "../components/CarList";
import { useWeb3 } from "../context/Web3Context";
import backIcon from '../assets/back.png';


const RenterPage = () => {
  const navigate = useNavigate();
  const { signer, account, loading } = useWeb3(true);

  useEffect(() => {
    if (!loading && (!signer || !account)) {
      navigate("/");
    }
  }, [signer, account, loading]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl font-medium">🔄 MetaMask 연결 중...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blur blobs */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/3 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="text-center text-white mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-black mb-2">🚗 차량 대여 서비스</h1>
          <p className="text-purple-200">스마트 계약 기반으로 빠르고 안전하게</p>
          <div className="mt-4">
            <p className="text-xs text-purple-300 mb-1">연결된 지갑 주소</p>
            <p className="font-mono text-sm bg-white/10 rounded px-3 py-2 inline-block">
              {account}
            </p>
            <div className="flex justify-center mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-green-300 font-medium">연결됨</span>
            </div>
          </div>
          <div className="text-center mt-8 animate-fade-in-up animation-delay-600">
            <button
              onClick={() => navigate("/role")}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-300 flex items-center justify-center space-x-2 mx-auto"
            >
            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>서비스 변경</span>
            </button>
          </div>

        </div>

        <div className="animate-fade-in-up animation-delay-300">
          <CarList signer={signer} account={account} />
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
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
          animation: fade-in-up 0.8s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default RenterPage;

