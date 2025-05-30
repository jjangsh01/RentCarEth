// src/components/WalletLoginModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useManualWeb3 from "../hooks/useManualWeb3";

const WalletLoginModal = ({ onClose }) => {
  const [inputAddress, setInputAddress] = useState("");
  const [trigger, setTrigger] = useState(false);
  const [step, setStep] = useState("input"); // input | kycCheck
  const { isKYCApproved, validAddress, loading } = useManualWeb3(inputAddress, trigger);
  const navigate = useNavigate();

  const handleKYCCheck = () => {
    setTrigger(true);
    setStep("kycCheck");
  };

    const handleMetaMaskConnect = async () => {
    try {
        const [walletAddr] = await window.ethereum.request({
        method: "eth_requestAccounts",
        });

        if (walletAddr.toLowerCase() !== inputAddress.toLowerCase()) {
        alert("⚠️ 입력한 지갑 주소와 MetaMask 지갑 주소가 일치하지 않습니다.");
        return;
        }

        if (isKYCApproved) {
        navigate("/role", { state: { address: inputAddress } });
        } else {
        // ✅ KYC 인증 페이지로 이동
        navigate("/kyc", { state: { address: inputAddress } });
        }
    } catch (err) {
        console.error("❌ MetaMask 연결 실패:", err);
        alert("❌ MetaMask 연결에 실패했습니다.");
    }
    };

    return (
    <div
        id="wallet-modal"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={(e) => {
        if (e.target.id === "wallet-modal") onClose();
        }}
    >
        <div className="relative w-full max-w-md animate-scale-in">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        </div>

        {/* Main modal */}
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 transform hover:scale-[1.01] transition-all duration-300">
            {/* Close button */}
            <button
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110"
            onClick={onClose}
            >
            <span className="text-xl">×</span>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🦊</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                지갑 연결
            </h2>
            <p className="text-purple-200 text-sm">MetaMask와 연결하여 시작하세요</p>
            </div>

            {step === "input" && (
            <div className="space-y-4 animate-fade-in-up">
                <div className="relative">
                <input
                    type="text"
                    placeholder="0x... 지갑 주소를 입력하세요"
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    inputAddress.startsWith("0x") ? "bg-green-400" : "bg-gray-400"
                    }`}></div>
                </div>
                </div>
                
                <button
                onClick={handleKYCCheck}
                disabled={!inputAddress.startsWith("0x")}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-2xl transform hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-2xl disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3">
                    <span className="text-lg">✅</span>
                    <span>KYC 상태 확인</span>
                    {!inputAddress.startsWith("0x") && (
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    )}
                </div>
                </button>
            </div>
            )}

            {step === "kycCheck" && (
            <div className="space-y-4 animate-fade-in-up">
                {loading ? (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4 animate-spin">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xl">🔍</span>
                    </div>
                    </div>
                    <p className="text-white font-medium">KYC 상태 확인 중...</p>
                    <p className="text-purple-200 text-sm mt-1">잠시만 기다려주세요</p>
                </div>
                ) : validAddress ? (
                isKYCApproved ? (
                    <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-xl">
                        <span className="text-2xl">✅</span>
                    </div>
                    <div>
                        <p className="text-green-400 font-semibold text-lg">KYC 인증 완료</p>
                        <p className="text-green-300 text-sm mt-1">인증된 지갑입니다</p>
                    </div>
                    <button
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transform hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-2xl"
                        onClick={handleMetaMaskConnect}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center space-x-3">
                        <span className="text-xl">🦊</span>
                        <span>MetaMask 연동 후 계속하기</span>
                        <span className="text-lg">→</span>
                        </div>
                    </button>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4 shadow-xl">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                        <p className="text-yellow-400 font-semibold text-lg">KYC 미인증</p>
                        <p className="text-yellow-300 text-sm mt-1">신원 인증이 필요합니다</p>
                    </div>
                    <button
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-2xl transform hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-2xl"
                        onClick={handleMetaMaskConnect}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center space-x-3">
                        <span className="text-xl">🦊</span>
                        <span>MetaMask 연동 후 KYC 인증</span>
                        <span className="text-lg">→</span>
                        </div>
                    </button>
                    </div>
                )
                ) : (
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-4 shadow-xl">
                    <span className="text-2xl">❌</span>
                    </div>
                    <div>
                    <p className="text-red-400 font-semibold text-lg">유효하지 않은 주소</p>
                    <p className="text-red-300 text-sm mt-1">올바른 지갑 주소를 입력해주세요</p>
                    </div>
                    <button
                    className="w-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300"
                    onClick={() => {
                        setStep("input");
                        setTrigger(false);
                    }}
                    >
                    다시 입력하기
                    </button>
                </div>
                )}
            </div>
            )}

            {/* Footer info */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-purple-200 text-xs">
                🔒 안전한 블록체인 연결을 통해 투명한 거래를 보장합니다
            </p>
            </div>
        </div>

        <style jsx>{`
            .animation-delay-2000 {
            animation-delay: 2s;
            }
            @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
            }
            @keyframes scale-in {
            from { 
                opacity: 0; 
                transform: scale(0.9) translateY(20px); 
            }
            to { 
                opacity: 1; 
                transform: scale(1) translateY(0); 
            }
            }
            @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
            }
            .animate-fade-in {
            animation: fade-in 0.3s ease-out;
            }
            .animate-scale-in {
            animation: scale-in 0.4s ease-out;
            }
            .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out;
            }
        `}</style>
        </div>
    </div>
    );
};

export default WalletLoginModal;
