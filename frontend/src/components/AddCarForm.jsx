//src/components/AddCarForm.jsx
import { useState } from "react";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";

const AddCarForm = ({ signer, account }) => {
  const [model, setModel] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [msg, setMsg] = useState("");

  const isAdmin = account.toLowerCase() === import.meta.env.VITE_ADMIN_ADDRESS.toLowerCase();

  const contract = new ethers.Contract(
    import.meta.env.VITE_CONTRACT_REGISTRY,
    CarRegistryABI.abi,
    signer
  );

  const addCar = async () => {
    try {
      const price = ethers.parseEther(pricePerDay);
      const tx = await contract.addCar(model, location, price);
      await tx.wait();
      setMsg("✅ 차량 등록 완료");
    } catch (err) {
      setMsg(`❌ 등록 실패: ${err.message}`);
    }
  };

  if (!isAdmin) return null;

  return (
    <div>
      <h2>🛠 차량 등록 (관리자 전용)</h2>
      <input placeholder="모델명" value={model} onChange={(e) => setModel(e.target.value)} />
      <input placeholder="위치" value={location} onChange={(e) => setLocation(e.target.value)} />
      <input placeholder="1일 요금 (ETH)" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} />
      <button onClick={addCar}>차량 등록</button>
      <p>{msg}</p>
    </div>
  );
};

export default AddCarForm;

