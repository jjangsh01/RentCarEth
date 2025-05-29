// src/components/MyCarList.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";

const MyCarList = ({ signer, account }) => {
  const [myCars, setMyCars] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const contract = new ethers.Contract(
          import.meta.env.VITE_CONTRACT_REGISTRY,
          CarRegistryABI.abi,
          signer
        );

        const plateNumbers = await contract.getCarPlates();
        const cars = [];

        for (const plate of plateNumbers) {
          const [id, model, location, pricePerDay, status, renter, owner] =
            await contract.getCar(plate);
          if (owner.toLowerCase() === account.toLowerCase()) {
            cars.push({
              id,
              model,
              location,
              price: ethers.formatEther(pricePerDay),
              status: Number(status),
            });
          }
        }

        setMyCars(cars);
      } catch (error) {
        console.error("❌ 내 차량 불러오기 실패:", error);
      }
    };

    if (signer && account) {
      fetchCars();
    }
  }, [signer, account]);

  if (myCars.length === 0) return <p>📭 등록된 차량이 없습니다.</p>;

  return (
    <div>
      <h2>📋 내가 등록한 차량 목록</h2>
      <ul>
        {myCars.map((car) => (
          <li key={car.id}>
            <strong>{car.model}</strong> - {car.id} ({car.location})<br />
            💰 {car.price} ETH<br />
            📦 상태: {car.status === 0 ? "🟢 사용 가능" : car.status === 1 ? "🟡 대여 중" : "🔧 점검 중"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyCarList;
