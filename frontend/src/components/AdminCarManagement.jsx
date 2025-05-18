// src/components/AdminCarManagement.jsx
import { useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";

const AdminCarManagement = ({ signer }) => {
  const [plateNumber, setPlateNumber] = useState("");
  const [model, setModel] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [msg, setMsg] = useState("");

  const contract = new ethers.Contract(
    import.meta.env.VITE_CONTRACT_REGISTRY,
    CarRegistryABI.abi,
    signer
  );

  const updateCar = async () => {
    try {
      const price = pricePerDay ? ethers.parseEther(pricePerDay) : 0;
      await contract.updateCar(plateNumber, model, location, price);
      setMsg("✅ 차량 수정 완료");
    } catch (err) {
      setMsg(`❌ 수정 실패: ${err.message}`);
    }
  };

  const deleteCar = async () => {
    try {
      await contract.deleteCar(plateNumber);
      setMsg("✅ 차량 삭제 완료");
    } catch (err) {
      setMsg(`❌ 삭제 실패: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>🛠 차량 관리 (수정/삭제)</h2>
      <input
        placeholder="차량 번호판 (예: 가1234)"
        value={plateNumber}
        onChange={(e) => setPlateNumber(e.target.value)}
      />
      <input
        placeholder="모델명 (수정할 경우)"
        value={model}
        onChange={(e) => setModel(e.target.value)}
      />
      <input
        placeholder="위치 (수정할 경우)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        placeholder="1일 요금 (ETH) (수정할 경우)"
        value={pricePerDay}
        onChange={(e) => setPricePerDay(e.target.value)}
      />
      <button onClick={updateCar}>수정</button>
      <button onClick={deleteCar}>삭제</button>
      <p>{msg}</p>
    </div>
  );
};

export default AdminCarManagement;

