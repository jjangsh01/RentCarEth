// src/components/CarList.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";
import CarRentalABI from "../abi/CarRental.json";

const CarList = ({ signer, account }) => {
  const [cars, setCars] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedRental, setSelectedRental] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 보증금 비율 설정 (대여료의 2배)
  const DEPOSIT_MULTIPLIER = 2;

  const statusMap = {
    0: "🟢 사용 가능",
    1: "🟡 대여 중",
    2: "🔧 점검 중",
  };

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

  useEffect(() => {
    const loadCars = async () => {
      try {
        const plateNumbers = await registryContract.getCarPlates();
        const carList = [];

        for (const plateNumber of plateNumbers) {
          const [plate, model, location, pricePerDay, status, renter, owner] =
            await registryContract.getCar(plateNumber);

          const isMyCar = owner.toLowerCase() === account.toLowerCase();
          const isAvailable = Number(status) === 0;

          // ✅ 필터: 내가 등록하지 않은 + 사용 가능한 차량만 포함
          if (!isMyCar && isAvailable) {
            carList.push({
              id: plate,
              model,
              location,
              pricePerDay: ethers.formatEther(pricePerDay),
              status: Number(status),
              renter: renter.toLowerCase(),
              owner: owner.toLowerCase(),
            });
          }
        }

        setCars(carList);
      } catch (error) {
        console.error("🚨 차량 목록 불러오기 실패:", error);
      }
    };

    if (signer) {
      loadCars();
    }
  }, [signer]);

  // 보증금 계산 함수
  const calculateDeposit = (pricePerDay) => {
    return (parseFloat(pricePerDay) * DEPOSIT_MULTIPLIER).toFixed(3);
  };

  // 총 비용 계산 함수
  const calculateTotalCost = (pricePerDay) => {
    const rental = parseFloat(pricePerDay);
    const deposit = parseFloat(calculateDeposit(pricePerDay));
    return (rental + deposit).toFixed(3);
  };

  // 대여 확인 모달 표시
  const showRentConfirmation = (car) => {
    setShowDepositModal(car);
  };

  const rentCar = async (plateNumber, pricePerDay) => {
    try {
      setLoading(true);
      setMsg("⏳ 대여 처리 중...");
      
      // 대여료 + 보증금 계산
      const rentalFee = ethers.parseEther(pricePerDay);
      const depositAmount = ethers.parseEther(calculateDeposit(pricePerDay));
      const totalAmount = rentalFee + depositAmount;
      
      console.log("💰 결제 정보:", {
        대여료: pricePerDay + " ETH",
        보증금: calculateDeposit(pricePerDay) + " ETH",
        총액: ethers.formatEther(totalAmount) + " ETH"
      });

      const tx = await rentalContract.rentCar(plateNumber, { value: totalAmount });
      await tx.wait();
      
      setMsg("✅ 차량 대여 완료! 보증금은 반납 시 환불됩니다.");
      setShowDepositModal(null);

      // 상태 다시 로드
      const updatedCars = cars.filter((car) => car.id !== plateNumber);
      setCars(updatedCars);
    } catch (error) {
      console.error("❌ 대여 실패:", error);
      setMsg(`❌ 대여 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const returnCar = async (plateNumber) => {
    try {
      setMsg("⏳ 반납 처리 중...");
      const tx = await rentalContract.completeRental(plateNumber);
      await tx.wait();
      setMsg("✅ 차량 반납 완료! 보증금이 환불되었습니다.");
      await showRentalInfo(plateNumber);
    } catch (error) {
      console.error("❌ 반납 실패:", error);
      setMsg(`❌ 반납 실패: ${error.message}`);
    }
  };

  const showRentalInfo = async (plateNumber) => {
    try {
      const [renter, amountPaid, timestamp, returned] =
        await rentalContract.getRentalInfo(plateNumber);

      if (
        renter === "0x0000000000000000000000000000000000000000" ||
        Number(amountPaid) === 0
      ) {
        setSelectedRental(null);
        return;
      }

      setSelectedRental({
        plateNumber,
        renter,
        amount: ethers.formatEther(amountPaid),
        date: new Date(Number(timestamp) * 1000).toLocaleString(),
        returned,
      });
    } catch (err) {
      console.error("🚨 계약 정보 조회 실패:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-pink-600/5 animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl">🚘</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                렌트 가능한 차량
              </h2>
              <p className="text-blue-200/80 text-sm">블록체인 기반 안전한 차량 공유</p>
            </div>
          </div>
          
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm p-4 rounded-2xl border border-yellow-400/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-yellow-200 font-medium">보증금 안내</p>
                <p className="text-yellow-200/80 text-sm">
                  대여료의 {DEPOSIT_MULTIPLIER}배 보증금이 자동으로 차감되며, 반납 시 전액 환불됩니다.
                </p>
              </div>
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
      {cars.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-slate-800/50 to-blue-900/30 backdrop-blur-md rounded-3xl border border-white/10">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
            <span className="text-4xl opacity-50">🚗</span>
          </div>
          <h3 className="text-xl font-semibold text-white/80 mb-2">현재 대여 가능한 차량이 없습니다</h3>
          <p className="text-blue-200/60">잠시 후 다시 확인해주세요!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {cars.map((car, index) => (
            <div 
              key={car.id} 
              className="group relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Car Image */}
              <div className="relative overflow-hidden">
                <img
                  src={`https://source.unsplash.com/400x240/?car,${car.model}`}
                  alt={car.model}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold border border-green-400/50">
                    사용가능
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Car Info */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{car.model}</h3>
                  <div className="flex items-center gap-2 text-blue-200/80 text-sm mb-1">
                    <span>📍</span>
                    <span>{car.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{statusMap[car.status].split(' ')[0]}</span>
                    <span className="text-gray-300">{statusMap[car.status].slice(2)}</span>
                  </div>
                </div>

                {/* Pricing Info */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-4 rounded-2xl border border-blue-400/20">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">대여료</span>
                      <span className="text-blue-300 font-semibold">{car.pricePerDay} ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">보증금</span>
                      <span className="text-yellow-300 font-semibold">{calculateDeposit(car.pricePerDay)} ETH</span>
                    </div>
                    <div className="border-t border-white/10 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white">총 결제금액</span>
                        <span className="text-green-400 font-bold text-lg">{calculateTotalCost(car.pricePerDay)} ETH</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rent Button */}
                <button
                  onClick={() => showRentConfirmation(car)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/30"
                >
                  🚗 대여하기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deposit Confirmation Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-800/95 via-blue-900/85 to-slate-800/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">결제 확인</h3>
              <p className="text-gray-300 text-sm">{showDepositModal.model} 대여</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">대여료</span>
                    <span className="text-blue-300 font-semibold">{showDepositModal.pricePerDay} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">보증금 (반납시 환불)</span>
                    <span className="text-yellow-300 font-semibold">{calculateDeposit(showDepositModal.pricePerDay)} ETH</span>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">총 결제금액</span>
                      <span className="text-green-400 font-bold text-lg">{calculateTotalCost(showDepositModal.pricePerDay)} ETH</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-3 rounded-xl border border-yellow-400/20">
                <p className="text-yellow-200 text-xs">
                  💡 보증금은 차량 반납 시 자동으로 환불됩니다.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDepositModal(null)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-gray-600/20 to-gray-700/20 hover:from-gray-500/30 hover:to-gray-600/30 border border-gray-400/20 text-gray-200 hover:text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-300"
              >
                취소
              </button>
              <button
                onClick={() => rentCar(showDepositModal.id, showDepositModal.pricePerDay)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    처리중...
                  </div>
                ) : (
                  '결제하기'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRental && (
        <div className="mt-6">
          <RentalInfoModal rental={selectedRental} onClose={() => setSelectedRental(null)} />
        </div>
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

export default CarList;
