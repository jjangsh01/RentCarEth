// src/components/CarList.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";
import CarRentalABI from "../abi/CarRental.json";

const CarList = ({ signer, account }) => {
    const [cars, setCars] = useState([]);
    const [msg, setMsg] = useState("");
    const [selectedRental, setSelectedRental] = useState(null);

    const statusMap = {
        0: "🟢 사용 가능",
        1: "🟡 대여 중",
        2: "🔧 점검 중",
    };

    const registryContract = new ethers.Contract(import.meta.env.VITE_CONTRACT_REGISTRY, CarRegistryABI.abi, signer);

    const rentalContract = new ethers.Contract(import.meta.env.VITE_CONTRACT_RENTAL, CarRentalABI.abi, signer);

    useEffect(() => {
        const loadCars = async () => {
            try {
                const plateNumbers = await registryContract.getCarPlates();
                const carList = [];

                for (const plateNumber of plateNumbers) {
                    const [plate, model, location, pricePerDay, status, renter, owner] = await registryContract.getCar(plateNumber);

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

    const rentCar = async (plateNumber, pricePerDay) => {
        try {
            setMsg("⏳ 대여 처리 중...");
            const rentalFee = ethers.parseEther(pricePerDay);
            const deposit = rentalFee; // 예: 보증금 = 렌탈 요금과 동일
            const totalFee = rentalFee + deposit; // BigInt 연산

            const tx = await rentalContract.rentCar(plateNumber, {
                value: totalFee,
            });

            await tx.wait();
            setMsg("✅ 차량 대여 완료!");

            // 상태 다시 로드
            const updatedCars = cars.filter((car) => car.id !== plateNumber);
            setCars(updatedCars);
        } catch (error) {
            console.error("❌ 대여 실패:", error);
            setMsg(`❌ 대여 실패: ${error.message}`);
        }
    };

    const returnCar = async (plateNumber) => {
        try {
            setMsg("⏳ 반납 처리 중...");
            const tx = await rentalContract.completeRental(plateNumber);
            await tx.wait();
            setMsg("✅ 차량 반납 완료!");
            await showRentalInfo(plateNumber);
        } catch (error) {
            console.error("❌ 반납 실패:", error);
            setMsg(`❌ 반납 실패: ${error.message}`);
        }
    };

    const showRentalInfo = async (plateNumber) => {
        try {
            const [renter, amountPaid, timestamp, returned] = await rentalContract.getRentalInfo(plateNumber);

            if (renter === "0x0000000000000000000000000000000000000000" || Number(amountPaid) === 0) {
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
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">🚘 렌트 가능한 차량</h2>

            {msg && <p className="text-sm text-purple-200 mb-2">{msg}</p>}

            {cars.length === 0 ? (
                <p className="text-sm text-gray-300">📭 현재 대여 가능한 차량이 없습니다.</p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {cars.map((car) => (
                        <div key={car.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-md animate-fade-in-up">
                            {/* 이미지 */}
                            <img src={`https://source.unsplash.com/400x240/?car,${car.model}`} alt={car.model} className="rounded-xl mb-3 w-full h-40 object-cover shadow" />

                            {/* 정보 */}
                            <div className="text-white space-y-1 mb-4">
                                <h3 className="text-lg font-bold">{car.model}</h3>
                                <p className="text-sm text-gray-300">📍 {car.location}</p>
                                <p className="text-sm text-gray-300">💰 {car.pricePerDay} ETH</p>
                                <p className="text-sm">{statusMap[car.status]}</p>
                            </div>

                            {/* 버튼 */}
                            <div className="flex gap-2">
                                <button onClick={() => rentCar(car.id, car.pricePerDay)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                                    대여하기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedRental && (
                <div className="mt-6">
                    <RentalInfoModal rental={selectedRental} onClose={() => setSelectedRental(null)} />
                </div>
            )}
        </div>
    );
};

export default CarList;
