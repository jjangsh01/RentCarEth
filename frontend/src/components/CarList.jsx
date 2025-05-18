import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";
import CarRentalABI from "../abi/CarRental.json";

const CarList = ({ signer }) => {
  const [cars, setCars] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedRental, setSelectedRental] = useState(null);

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
          const [
            plate,
            model,
            location,
            pricePerDay,
            status,
            renter
          ] = await registryContract.getCar(plateNumber);

          carList.push({
            id: plate,
            model,
            location,
            pricePerDay: ethers.formatEther(pricePerDay),
            status: Number(status),
            renter: renter.toLowerCase(),
          });
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
      const rentFee = ethers.parseEther(pricePerDay);
      const tx = await rentalContract.rentCar(plateNumber, { value: rentFee });
      await tx.wait();
      setMsg("✅ 차량 대여 완료!");
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

      // 🔁 반납 완료 후 계약 정보 갱신
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
              ) : car.status === 1 && car.renter === signer.address.toLowerCase() ? (
                <button onClick={() => returnCar(car.id)}>🔁 반납하기</button>
              ) : (
                <span>⛔ 반납 불가</span>
              )}
              <br />
              {/* 계약 내역 버튼은 대여된 차량에만 표시 */}
              {car.renter !== "0x0000000000000000000000000000000000000000" && (
                <button onClick={() => showRentalInfo(car.id)}>📜 계약 내역 보기</button>
              )}
            </li>
          ))}
        </ul>
      )}
      {selectedRental && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #aaa" }}>
          <h3>📜 계약 내역</h3>
          <p>📍 차량: {selectedRental.plateNumber}</p>
          <p>👤 대여자: {selectedRental.renter}</p>
          <p>💰 지불 금액: {selectedRental.amount} ETH</p>
          <p>📅 대여일시: {selectedRental.date}</p>
          <p>📦 상태: {selectedRental.returned ? "✅ 반납 완료" : "⏳ 대여 중"}</p>
        </div>
      )}
    </div>
  );
};

export default CarList;




