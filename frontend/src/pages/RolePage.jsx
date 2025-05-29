// pages/RolePage.jsx
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

const RolePage = () => {
  const navigate = useNavigate();
  const { signer, account, loading } = useWeb3(true);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-medium">MetaMask 연결 중...</p>
        </div>
      </div>
    );

  if (!signer || !account)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl font-medium">지갑 연결 실패</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-3/4 left-3/4 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <span className="text-2xl"></span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            서비스 선택
          </h1>
          <p className="text-slate-300 text-lg font-medium mb-6">
            어떤 방식으로 이용하시겠습니까?
          </p>
          
          {/* Wallet info */}
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
            <p className="text-xs text-slate-400 mb-1">연결된 지갑</p>
            <p className="text-slate-300 font-mono text-sm break-all">
              {account}
            </p>
            <div className="flex items-center justify-center mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-green-400 font-medium">연결됨</span>
            </div>
          </div>
        </div>

        {/* Role selection cards */}
        <div className="space-y-4 animate-fade-in-up animation-delay-300">
          {/* Renter option */}
          <button
            onClick={() => navigate("/renter")}
            className="w-full group relative overflow-hidden backdrop-blur-lg bg-white/10 hover:bg-white/15 border border-white/20 hover:border-blue-400/50 rounded-3xl p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-2xl">🚗</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-white mb-1">차량 대여하기</h3>
                <p className="text-slate-300 text-sm">원하는 차량을 찾아 즉시 대여</p>
              </div>
              <div className="text-white/50 group-hover:text-white/80 transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="relative mt-4 flex space-x-6 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>즉시 대여</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🔒</span>
                <span>안전 보장</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>💎</span>
                <span>투명한 거래</span>
              </div>
            </div>
          </button>

          {/* Owner option */}
          <button
            onClick={() => navigate("/owner")}
            className="w-full group relative overflow-hidden backdrop-blur-lg bg-white/10 hover:bg-white/15 border border-white/20 hover:border-green-400/50 rounded-3xl p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-2xl"></span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-white mb-1">내 차량 관리</h3>
                <p className="text-slate-300 text-sm">차량 등록 및 대여 현황 관리</p>
              </div>
              <div className="text-white/50 group-hover:text-white/80 transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="relative mt-4 flex space-x-6 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <span>📊</span>
                <span>수익 관리</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🛡️</span>
                <span>보험 보장</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📈</span>
                <span>실시간 현황</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in-up animation-delay-600">
          <button
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-300 flex items-center justify-center space-x-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>처음으로 돌아가기</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
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
          animation: fade-in-up 0.8s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default RolePage;




