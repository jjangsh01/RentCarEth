// src/components/RentalInfoModal.jsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const RentalInfoModal = ({ rental, onClose }) => {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // 배경 클릭 시 모달 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 모달 내용 클릭 시 이벤트 전파 방지
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-2xl h-[90vh] flex flex-col bg-gradient-to-br from-slate-800/95 via-purple-900/85 to-slate-800/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl animate-slideUp"
        onClick={handleModalClick}
      >
        {/* Header with Close Button - 고정 높이 */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-blue-500/20 p-6 rounded-t-3xl border-b border-white/10 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10 animate-pulse"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group z-20"
          >
            <span className="text-white/70 group-hover:text-white text-xl">✕</span>
          </button>

          <div className="relative z-10 text-center pr-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
              <span className="text-2xl">📜</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              스마트 계약 정보
            </h2>
            <p className="text-purple-200/80 text-sm mt-2">블록체인에 기록된 대여 계약 내역</p>
          </div>
        </div>

        {/* Scrollable Content Body - 가변 높이, 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-white/10">
          {/* Contract Details Cards */}
          <div className="space-y-3">
            <div className="group bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-lg">🚗</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">차량 번호판</p>
                    <p className="text-white font-bold font-mono text-lg">{rental.plate}</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="group bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-lg">👤</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-400 font-medium">대여자 주소</p>
                    <p className="text-white font-mono text-sm break-all">{rental.renter}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">결제 금액</p>
                    <p className="text-green-400 font-bold text-xl">{rental.amount} ETH</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                    결제완료
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-lg">📅</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">대여 시작</p>
                    <p className="text-white font-medium text-lg">{rental.date}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${
                    rental.returned 
                      ? 'from-green-500 to-emerald-600' 
                      : 'from-yellow-500 to-orange-600'
                  } rounded-xl flex items-center justify-center shadow-md`}>
                    <span className="text-lg">{rental.returned ? '✅' : '⏳'}</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">대여 상태</p>
                    <p className={`font-bold text-lg ${rental.returned ? 'text-green-400' : 'text-yellow-400'}`}>
                      {rental.returned ? '반납 완료' : '대여 중'}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                  rental.returned 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {rental.returned ? 'COMPLETED' : 'ACTIVE'}
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Info */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm p-5 rounded-2xl border border-indigo-400/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-sm">🔗</span>
              </div>
              <span className="text-indigo-300 font-semibold">블록체인 검증</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              이 계약은 이더리움 블록체인에 영구적으로 기록되어 있으며, 
              스마트 컨트랙트를 통해 자동으로 실행됩니다. 모든 거래는 투명하고 변경 불가능합니다.
            </p>
          </div>
        </div>

        {/* Footer - 고정 높이 */}
        <div className="p-6 border-t border-white/10 bg-gradient-to-r from-slate-800/50 to-purple-900/30 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-600/20 to-gray-700/20 hover:from-gray-500/30 hover:to-gray-600/30 border border-gray-400/20 text-gray-200 hover:text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                <span></span>
                <span>닫기</span>
              </span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30"
            >
              <span className="flex items-center justify-center gap-2">
                <span></span>
                <span>확인</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* 커스텀 스크롤바 스타일링 */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-purple-500 {
          --scrollbar-thumb: rgb(168 85 247);
        }
        
        .scrollbar-track-white\/10 {
          --scrollbar-track: rgba(255, 255, 255, 0.1);
        }

        /* 웹킷 기반 브라우저용 스크롤바 */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          margin: 8px 0;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
        }
      `}</style>
    </div>,
    document.body
  );
};

export default RentalInfoModal;