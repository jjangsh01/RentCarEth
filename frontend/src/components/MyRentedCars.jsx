// src/components/MyRentedCars.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";
import CarRentalABI from "../abi/CarRental.json";
import RentalInfoModal from "./RentalInfoModal";
import locationIcon from '../assets/location.png';

<<<<<<< HEAD
const MyRentedCars = ({ signer, account, onCountChange = () => {} }) => {
=======
const MyRentedCars = ({ signer, account }) => {
>>>>>>> jin
  const [cars, setCars] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

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

  const loadRentedCars = async () => {
    try {
      const plates = await registryContract.getCarPlates();
      const results = [];

      for (const plate of plates) {
        const [id, model, location, price, status, renter, owner] =
          await registryContract.getCar(plate);

        if (renter.toLowerCase() === account.toLowerCase()) {
          results.push({
            plate: id,
            model,
            location,
            price: ethers.formatEther(price),
            status,
            renter,
            owner,
          });
        }
      }

      setCars(results);
<<<<<<< HEAD
      onCountChange(results.length);
=======
>>>>>>> jin
    } catch (err) {
      console.error("❌ 렌트 차량 목록 불러오기 실패:", err);
    }
  };

  const returnCar = async (plate) => {
    try {
      setLoading(true);
      setMsg("⏳ 반납 중...");
      const tx = await rentalContract.completeRental(plate);
      await tx.wait();
      setMsg("✅ 반납 완료");
      await loadRentedCars(); // 🔁 실시간 목록 갱신
    } catch (err) {
      setMsg(`❌ 반납 실패: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
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
    if (signer && account) loadRentedCars();
  }, [signer, account]);

  return (
    <div className="relative group">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 blur-sm"></div>
      <div className="relative backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-3 transition-all duration-300">
              <span className="text-2xl"></span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                내가 대여한 차량
              </h2>
              <p className="text-slate-300 text-sm">현재 대여 중인 차량을 관리하세요</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{cars.length}</p>
            <p className="text-xs text-slate-400">대여 중</p>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div className={`mb-6 p-4 rounded-2xl backdrop-blur-sm border ${
            msg.includes('✅') 
              ? 'bg-green-500/10 border-green-400/20 text-green-300' 
              : msg.includes('⏳')
              ? 'bg-blue-500/10 border-blue-400/20 text-blue-300'
              : 'bg-red-500/10 border-red-400/20 text-red-300'
          } animate-fade-in`}>
            <p className="text-sm font-medium">{msg}</p>
          </div>
        )}

        {/* Cars list */}
        {cars.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl opacity-50">📭</span>
            </div>
            <p className="text-slate-400">현재 대여 중인 차량이 없습니다</p>
            <p className="text-xs text-slate-500 mt-1">차량을 대여해서 편리하게 이용해보세요!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {cars.map((car, index) => (
              <div 
                key={car.plate} 
                className="group/card relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Active rental indicator */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 border border-green-400/20 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    대여 중
                  </div>
                </div>

                {/* Car info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🚗</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{car.model}</h3>
                      <p className="text-sm text-slate-400 font-mono">{car.plate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-lg">
                        <img src={locationIcon} alt="currency" className="w-5 h-5 inline" />
                      </span>
                      <span className="text-sm">{car.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-lg"></span>
                      <span className="text-sm font-semibold">{car.price} ETH</span>
                    </div>
                  </div>

                  {/* Owner info */}
                  <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
                    <p className="text-xs text-blue-300 font-medium mb-1">차량 소유자</p>
                    <p className="text-sm text-white font-mono">{car.owner}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => returnCar(car.plate)}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          반납 중...
                        </>
                      ) : (
                        <>
                          반납하기
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => showRentalInfo(car.plate)}
                      className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                      disabled={loading}
                    >
                      📜 계약서 보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedRental && (
          <RentalInfoModal rental={selectedRental} onClose={() => setSelectedRental(null)} />
        )}
      </div>
    </div>
  );
};

export default MyRentedCars;
