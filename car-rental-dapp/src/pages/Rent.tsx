import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../contexts/Web3Context";
import { getContract } from "../utils/contract";

type Car = {
  id: number;
  model: string;
  rentalFee: number;
  isAvailable: boolean;
};

const Rent: React.FC = () => {
  const { provider } = useWeb3();
  const [cars, setCars] = useState<Car[]>([]);

  const fetchCars = async () => {
    if (provider) {
      const contract = getContract(provider);
      const totalCars = await contract.totalCars();
      const carList: Car[] = [];
      for (let i = 0; i < totalCars; i++) {
        const car = await contract.cars(i);
        carList.push({
          id: car.id.toNumber(),
          model: car.model,
          rentalFee: ethers.utils.formatEther(car.rentalFee),
          isAvailable: car.isAvailable,
        });
      }
      setCars(carList);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [provider]);

  return (
    <div>
      <h2>Available Cars</h2>
      {cars.map((car) => (
        <div key={car.id}>
          <h3>{car.model}</h3>
          <p>Fee: {car.rentalFee} ETH</p>
          <p>Status: {car.isAvailable ? "Available" : "Rented"}</p>
        </div>
      ))}
    </div>
  );
};

export default Rent;
