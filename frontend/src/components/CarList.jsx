// src/components/CarList.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";
import CarRentalABI from "../abi/CarRental.json";

const CarList = ({ signer }) => {
  const [cars, setCars] = useState([]);
  const [msg, setMsg] = useState("");

  const statusMap = {
    0: "🟢 사용 가능",
    1: "🟡 대여 중",
    2: "🔧 점검 중",
  };

  // ✅ 차량 목록 불러오기용 (CarRegistry)
  const registryContract = new ethers.Contract(
    import.meta.env.VITE_CONTRACT_REGISTRY,
    CarRegistryABI.abi,
    signer
  );

  // ✅ 대여/반납 처리용 (CarRental)
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
        const [
          plate,
          model,
          location,
          pricePerDay,
          status,
          renter,
        ] = await registryContract.getCar(plateNumber);  // 튜플 분해

        carList.push({
          id: plate,
          model,
          location,
          pricePerDay: ethers.formatEther(pricePerDay),
          status: Number(status),
          renter,
        });
      }

        setCars(carList);
        console.log("✅ 차량 목록 불러오기 성공:", carList);
      } catch (error) {
        console.error("🚨 차량 목록 불러오기 실패:", error);
      }
    };

    if (signer) {
      loadCars();
    }
  }, [signer]);

  // 🚗 차량 대여
  const rentCar = async (plateNumber, pricePerDay) => {
    try {
      setMsg("⏳ 대여 처리 중...");

      // ✅ 번호판 문자열 길이 체크
      if (plateNumber.length === 0 || plateNumber.length > 32) {
        throw new Error("🚫 잘못된 번호판 길이 (1-32자)");
      }

      const rentFee = ethers.parseEther(pricePerDay);  // 요금 변환

      console.log(`🚗 대여 시도 - 번호판: ${plateNumber}, 요금: ${pricePerDay} ETH`);

      // ✅ 대여 함수 호출
      const tx = await rentalContract.rentCar(plateNumber, {
        value: rentFee,
      });
      await tx.wait();
      setMsg("✅ 차량 대여 완료!");
    } catch (error) {
      console.error("❌ 대여 실패:", error);
      setMsg(`❌ 대여 실패: ${error.message || "알 수 없는 오류"}`);
    }
  };

  const returnCar = async (plateNumber) => {
  try {
    setMsg("⏳ 반납 처리 중...");
    const tx = await rentalContract.completeRental(plateNumber);
    await tx.wait();
    setMsg("✅ 차량 반납 완료!");
  } catch (error) {
    console.error("❌ 반납 실패:", error);
    setMsg(`❌ 반납 실패: ${error.message || "알 수 없는 오류"}`);
  }
  };


  return (
    <div>
      <h2>🚘 차량 목록</h2>
      {msg && <p>{msg}</p>}
      {cars.length === 0 ? (
        <p>등록된 차량이 없습니다.</p>
      ) : (
        <ul>
          {cars.map((car) => (
            <li key={car.id} style={{ marginBottom: "15px" }}>
              <strong>{car.model}</strong> - 번호판: {car.id} ({car.location})<br />
              💰 {car.pricePerDay} ETH<br />
              📦 상태: {statusMap[car.status]}<br />
              {car.status === 0 ? (
                <button onClick={() => rentCar(car.id, car.pricePerDay)}>🚗 대여하기</button>
              ) : car.status === 1 && car.renter.toLowerCase() === signer.address.toLowerCase() ? (
                <button onClick={() => returnCar(car.id)}>🔁 반납하기</button>
              ) : (
                <span>⛔ 반납 불가</span>
              )}

            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CarList;



