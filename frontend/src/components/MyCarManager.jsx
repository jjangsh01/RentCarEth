// src/components/MyCarManager.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";
import CarRentalABI from "../abi/CarRental.json";
import RentalInfoModal from "./RentalInfoModal"; 
import locationIcon from '../assets/location.png';

const models = ["Hyundai Sonata", "Tesla Model 3", "Kia EV6"];
const locations = ["Seoul", "Incheon", "Busan"];
const prices = ["0.01", "0.05", "0.1"];

const MyCarManager = ({ signer, account, refreshSignal, onCarUpdated }) => {
  const [myCars, setMyCars] = useState([]);
  const [editingCar, setEditingCar] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  const registryContract = new ethers.Contract(
    import.meta.env.VITE_CONTRACT_REGISTRY,
    CarRegistryABI.abi,
    signer
  );

  const rentalContract = new ethers.Contract(
    import.meta.env.VITE_CONTRACT_RENTAL,
    CarRentalABI.abi,
    signer
  );

  const loadCars = async () => {
    try {
      const plates = await registryContract.getCarPlates();
      const cars = [];
      for (const plate of plates) {
        const [id, model, location, price, status, renter, owner] =
          await registryContract.getCar(plate);
        if (owner.toLowerCase() === account.toLowerCase()) {
          cars.push({
            plate: id,
            model,
            location,
            price: ethers.formatEther(price),
            status: Number(status),
            renter,
            owner,
          });
        }
      }
      setMyCars(cars);
    } catch (err) {
      console.error("❌ 차량 불러오기 실패:", err);
    }
  };

  const showRentalInfo = async (plate) => {
    try {
      const [renter, amountPaid, timestamp, returned] =
        await rentalContract.getRentalInfo(plate);

      setSelectedRental({
        plate,
        renter,
        amount: ethers.formatEther(amountPaid),
        date: new Date(Number(timestamp) * 1000).toLocaleString(),
        returned,
      });
    } catch (err) {
      console.error("❌ 계약 정보 오류:", err);
    }
  };

  useEffect(() => {
    if (signer && account) loadCars();
  }, [signer, account, refreshSignal]);

  const deleteCar = async (plate) => {
    try {
      setLoading(true);
      const tx = await registryContract.deleteCar(plate);
      await tx.wait();
      setMsg("✅ 삭제 완료");

      if (onCarUpdated) onCarUpdated();
      await loadCars();
    } catch (err) {
      setMsg(`❌ 삭제 실패: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateCar = async () => {
    try {
      setLoading(true);
      const { plate, model, location, price } = editingCar;
      const etherPrice = ethers.parseEther(price);
      const tx = await registryContract.updateCar(plate, model, location, etherPrice);
      await tx.wait();
      setEditingCar(null);
      setMsg("✅ 수정 완료");

      if (onCarUpdated) onCarUpdated();
      await loadCars();
    } catch (err) {
      setMsg(`❌ 수정 실패: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const statusText = {
    0: "사용 가능",
    1: "대여 중",
    2: "🔧 점검 중",
  };


  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-6 transition-transform">
              <span className="text-2xl">🚗</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                등록된 차량 관리
              </h2>
              <p className="text-purple-200/80 text-sm mt-1">스마트 컨트랙트로 안전하게 관리되는 차량들</p>
            </div>
          </div>
          
          {/* Stats Pills */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
              <span className="text-green-400 text-sm font-medium">총 {myCars.length}대 등록</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
              <span className="text-yellow-400 text-sm font-medium">
                {myCars.filter(car => car.status === 1).length}대 대여중
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {msg && (
        <div className={`p-4 rounded-2xl backdrop-blur-md border shadow-lg transform transition-all duration-500 ${
          msg.includes('✅') 
            ? 'bg-green-500/20 border-green-400/30 text-green-100' 
            : 'bg-red-500/20 border-red-400/30 text-red-100'
        }`}>
          <p className="font-medium flex items-center gap-2">
            {msg.includes('✅') ? '🎉' : '⚠️'} {msg}
          </p>
        </div>
      )}

      {/* Cars Grid */}
      {myCars.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-slate-800/50 to-purple-900/30 backdrop-blur-md rounded-3xl border border-white/10">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
            <span className="text-4xl opacity-50">🚗</span>
          </div>
          <h3 className="text-xl font-semibold text-white/80 mb-2">아직 등록된 차량이 없습니다</h3>
          <p className="text-purple-200/60">첫 번째 차량을 등록해보세요!</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {myCars.map((car, index) => (
            <div 
              key={car.plate} 
              className="group relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              
              {/* Status Indicator */}
              <div className="absolute -top-2 -right-2 z-10">
                <div className={`w-6 h-6 rounded-full border-4 border-slate-900 shadow-lg ${
                  car.status === 0 ? 'bg-green-400 animate-pulse' :
                  car.status === 1 ? 'bg-yellow-400 animate-bounce' :
                  'bg-red-400'
                }`}></div>
              </div>

              <div className="relative z-10 space-y-4">
                {/* Car Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-xl">🚙</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{car.model}</h3>
                        <p className="text-sm text-purple-200/80 font-mono">{car.plate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Car Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-lg">
                        <img src={locationIcon} alt="currency" className="w-5 h-5 inline" />
                      </span>
                    <span className="text-purple-200 font-medium">{car.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-lg"></span>
                    <span className="text-green-400 font-bold">{car.price} ETH</span>
                    <span className="text-sm text-gray-400">/ 시간</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-lg">
                      {car.status === 0 ? '🟢' : car.status === 1 ? '🟡' : '🔧'}
                    </span>
                    <span className={`font-semibold ${
                      car.status === 0 ? 'text-green-400' :
                      car.status === 1 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {statusText[car.status]}
                    </span>
                  </div>
                </div>

                {/* Rental Info */}
                {car.status === 1 && (
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm p-4 rounded-xl border border-yellow-400/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg"></span>
                      <span className="text-sm text-gray-300">현재 대여자</span>
                    </div>
                    <p className="font-mono text-xs text-yellow-200 break-all mb-3">{car.renter}</p>
                    <button
                      onClick={() => showRentalInfo(car.plate)}
                      className="w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-400/30 text-yellow-200 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium"
                    >
                      📋 계약 상세보기
                    </button>
                  </div>
                )}

                {/* Edit Form */}
                {editingCar?.plate === car.plate ? (
                  <div className="space-y-4 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-blue-400/20">
                    <div className="text-center mb-4">
                      <span className="text-lg"></span>
                      <span className="text-white font-semibold ml-2">차량 정보 수정</span>
                    </div>
                    
                    <select
                      value={editingCar.model}
                      onChange={(e) => setEditingCar({ ...editingCar, model: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 cursor-pointer"
                    >
                      {models.map((m) => <option className="bg-slate-800" key={m} value={m}>{m}</option>)}
                    </select>
                    
                    <select
                      value={editingCar.location}
                      onChange={(e) => setEditingCar({ ...editingCar, location: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 cursor-pointer"
                    >
                      {locations.map((l) => <option className="bg-slate-800" key={l} value={l}>{l}</option>)}
                    </select>
                    
                    <select
                      value={editingCar.price}
                      onChange={(e) => setEditingCar({ ...editingCar, price: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 cursor-pointer"
                    >
                      {prices.map((p) => <option className="bg-slate-800" key={p} value={p}>{p} ETH</option>)}
                    </select>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={updateCar}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            저장 중...
                          </div>
                        ) : (
                          <>저장</>
                        )}
                      </button>
                      <button
                        onClick={() => setEditingCar(null)}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingCar(car)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteCar(car.plate)}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <>삭제</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rental Info Modal */}
      {selectedRental && (
        <RentalInfoModal rental={selectedRental} onClose={() => setSelectedRental(null)} />
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .grid > div {
          animation: fadeInUp 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default MyCarManager;




