// src/components/RentForm.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";
import CarRentalABI from "../abi/CarRental.json";

const RentForm = ({ signer }) => {
  const [cars, setCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [msg, setMsg] = useState("");

  // 계약 주소 설정
  const rentalAddress = import.meta.env.VITE_CONTRACT_RENTAL;
  const registryAddress = import.meta.env.VITE_CONTRACT_REGISTRY;

  const rentalContract = new ethers.Contract(rentalAddress, CarRentalABI.abi, signer);
  const registryContract = new ethers.Contract(registryAddress, CarRegistryABI.abi, signer);

  // 차량 목록 불러오기
  useEffect(() => {
    const loadCars = async () => {
      try {
        const total = await registryContract.nextCarId();
        const carList = [];

        for (let i = 0; i < total; i++) {
          const car = await registryContract.getCar(i);
          carList.push({
            id: Number(car[0]),
            model: car[1],
            location: car[2],
          });
        }

        setCars(carList);
      } catch (error) {
        console.error("❌ 차량 목록 불러오기 실패:", error);
      }
    };

    loadCars();
  }, [signer]);

  // 차량 대여 함수
  const rentCar = async () => {
    try {
      const tx = await rentalContract.rentCar(selectedCarId, {
        value: ethers.parseEther("0.01"), // 테스트용 금액
      });
      await tx.wait();
      setMsg("✅ 차량 대여 완료!");
    } catch (error) {
      console.error("❌ 대여 실패:", error);
      setMsg("대여 실패: " + (error.message || error));
    }
  };

  return (
    <div>
      <h2>🚘 렌트카 예약</h2>
      <select
        value={selectedCarId}
        onChange={(e) => setSelectedCarId(e.target.value)}
      >
        <option value="">🚗 차량 선택</option>
        {cars.map((car) => (
          <option key={car.id} value={car.id}>
            {car.model} ({car.location})
          </option>
        ))}
      </select>
      <button onClick={rentCar} disabled={!selectedCarId}>
        예약
      </button>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default RentForm;



