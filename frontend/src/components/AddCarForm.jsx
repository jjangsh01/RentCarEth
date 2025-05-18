// src/components/AddCarForm.jsx
import { useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";

const AddCarForm = ({ signer }) => {
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

  const addCar = async () => {
    if (!signer) {
      setMsg("❗ MetaMask가 연결되지 않았습니다.");
      return;
    }

    try {
      const price = ethers.parseEther(pricePerDay);
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_REGISTRY,
        CarRegistryABI.abi,
        signer
      );

      await contract.addCar(plateNumber, model, location, price);
      setMsg("✅ 차량 등록 완료");
    } catch (err) {
      console.error("❌ 등록 실패:", err);
      setMsg(`❌ 등록 실패: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>🛠 차량 등록 (관리자 전용)</h2>
      <input
        placeholder="번호판 (예: 가1234)"
        value={plateNumber}
        onChange={(e) => setPlateNumber(e.target.value)}
      />
      <input
        placeholder="모델명 (예: Hyundai Sonata)"
        value={model}
        onChange={(e) => setModel(e.target.value)}
      />
      <input
        placeholder="위치 (예: Incheon)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        placeholder="1일 요금 (ETH)"
        value={pricePerDay}
        onChange={(e) => setPricePerDay(e.target.value)}
      />
      <button onClick={addCar}>등록</button>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default AddCarForm;


