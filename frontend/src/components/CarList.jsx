// src/components/CarList.jsx

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";

const CarList = ({ signer }) => {
  const [cars, setCars] = useState([]);

  const statusMap = {
    0: "🟢 사용 가능",
    1: "🟡 대여 중",
    2: "🔧 점검 중",
  };

  useEffect(() => {
    const loadCars = async () => {
      try {
        const contract = new ethers.Contract(
          import.meta.env.VITE_CONTRACT_REGISTRY,
          CarRegistryABI.abi,
          signer
        );

        const total = await contract.nextCarId();
        const carList = [];

        for (let i = 0; i < total; i++) {
          const car = await contract.getCar(i);
          carList.push({
            id: Number(car[0]),
            model: car[1],
            location: car[2],
            pricePerDay: ethers.formatEther(car[3]),
            status: Number(car[4]),
            renter: car[5],
          });
        }

        setCars(carList);
      } catch (error) {
        console.error("Failed to load cars:", error);
      }
    };

    if (signer) {
      loadCars();
    }
  }, [signer]);

  return (
    <div>
      <h2>🚘 차량 목록</h2>
      {cars.length === 0 ? (
        <p>등록된 차량이 없습니다.</p>
      ) : (
        <ul>
          {cars.map((car) => (
            <li key={car.id} style={{ marginBottom: "10px" }}>
              <strong>{car.model}</strong> ({car.location})<br />
              💰 {car.pricePerDay} ETH<br />
              📦 상태: {statusMap[car.status]}<br />
              {car.status === 1 && <span>👤 대여중: {car.renter}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CarList;

