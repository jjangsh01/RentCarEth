// src/components/AddCarForm.jsx
import { useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";

const AddCarForm = ({ signer, onCarUpdated }) => {
  const [plateNumber, setPlateNumber] = useState("");
  const [model, setModel] = useState("Hyundai Sonata");
  const [location, setLocation] = useState("Seoul");
  const [pricePerDay, setPricePerDay] = useState("0.01");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const addCar = async () => {
    if (!signer) {
      setMsg("❗ MetaMask가 연결되지 않았습니다.");
      return;
    }

    try {
      setLoading(true);
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_REGISTRY,
        CarRegistryABI.abi,
        signer
      );

      const price = ethers.parseEther(pricePerDay);
      const tx = await contract.addCar(plateNumber, model, location, price);
      await tx.wait();

      setMsg("✅ 차량 등록 완료");
      if (onCarUpdated) onCarUpdated();

      setPlateNumber("");
      setModel("Hyundai Sonata");
      setLocation("Seoul");
      setPricePerDay("0.01");
    } catch (err) {
      setMsg(`❌ 등록 실패: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      {/* Glassmorphism card with animated gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 blur-sm"></div>
      <div className="relative backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
        {/* Header with icon animation */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-3 transition-all duration-300">
            <span className="text-2xl">🚗</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              차량 등록
            </h2>
            <p className="text-slate-300 text-sm">새로운 차량을 등록하여 수익을 창출하세요</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Enhanced input fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span className="text-lg"></span>
              번호판
            </label>
            <input
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300"
              placeholder="예: 가1234"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span className="text-lg"></span>
              차량 모델
            </label>
            <select 
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 cursor-pointer"
              value={model} 
              onChange={(e) => setModel(e.target.value)} 
              disabled={loading}
            >
              <option value="Hyundai Sonata" className="bg-slate-800 text-white">Hyundai Sonata</option>
              <option value="Tesla Model 3" className="bg-slate-800 text-white">Tesla Model 3</option>
              <option value="Kia EV6" className="bg-slate-800 text-white">Kia EV6</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span className="text-lg"></span>
              대여 지역
            </label>
            <select 
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 cursor-pointer"
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              disabled={loading}
            >
              <option value="Seoul" className="bg-slate-800 text-white">Seoul</option>
              <option value="Incheon" className="bg-slate-800 text-white">Incheon</option>
              <option value="Busan" className="bg-slate-800 text-white">Busan</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span className="text-lg"></span>
              일일 대여료
            </label>
            <select 
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 cursor-pointer"
              value={pricePerDay} 
              onChange={(e) => setPricePerDay(e.target.value)} 
              disabled={loading}
            >
              <option value="0.01" className="bg-slate-800 text-white">0.01 ETH</option>
              <option value="0.05" className="bg-slate-800 text-white">0.05 ETH</option>
              <option value="0.1" className="bg-slate-800 text-white">0.1 ETH</option>
            </select>
          </div>

          {/* Modern button with loading state */}
          <button
            onClick={addCar}
            disabled={loading}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-2xl transform hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-purple-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>등록 중...</span>
                </>
              ) : (
                <>
                  <span className="text-xl"></span>
                  <span>차량 등록하기</span>
                </>
              )}
            </div>
          </button>

          {/* Message with better styling */}
          {msg && (
            <div className={`p-4 rounded-2xl backdrop-blur-sm border ${
              msg.includes('✅') 
                ? 'bg-green-500/10 border-green-400/20 text-green-300' 
                : 'bg-red-500/10 border-red-400/20 text-red-300'
            } animate-fade-in`}>
              <p className="text-sm font-medium">{msg}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default AddCarForm;




