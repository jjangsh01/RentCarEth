// src/pages/AuthPage.jsx
import { useState } from "react";
import WalletLoginModal from "../components/WalletLoginModal";

const AuthPage = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <span className="text-3xl"></span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            AutoRent
          </h1>
          <p className="text-lg text-purple-200 font-medium">
            스마트 계약 기반 차량 대여 플랫폼
          </p>
        </div>

        {/* Glass card */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
          <div className="space-y-4">
            {/* Login options */}
            <button 
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transform hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-2xl"
              disabled
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <span className="text-xl">🔐</span>
                <span>일반 로그인</span>
                <span className="text-xs bg-blue-700 px-2 py-1 rounded-full">개발 중</span>
              </div>
            </button>

            <button 
              className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-2xl transform hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-2xl"
              disabled
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <span className="text-xl">📝</span>
                <span>회원가입</span>
                <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">개발 중</span>
              </div>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-purple-200 font-medium">또는</span>
              </div>
            </div>

            <button
              onClick={() => setShowWalletModal(true)}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-2xl transform hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <span className="text-xl">🦊</span>
                <span>MetaMask로 연결</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="text-purple-200">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs font-medium">즉시 대여</div>
              </div>
              <div className="text-purple-200">
                <div className="text-2xl mb-1">🔒</div>
                <div className="text-xs font-medium">안전한 거래</div>
              </div>
              <div className="text-purple-200">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-xs font-medium">스마트 계약</div>
              </div>
              <div className="text-purple-200">
                <div className="text-2xl mb-1">🌟</div>
                <div className="text-xs font-medium">투명한 정산</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-purple-300 text-sm animate-fade-in-up">
          <p>스마트계약으로 더 안전하고 투명한 차량 대여 경험</p>
        </div>
      </div>

      {showWalletModal && (
        <WalletLoginModal onClose={() => setShowWalletModal(false)} />
      )}

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

export default AuthPage;


