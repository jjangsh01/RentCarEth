// src/pages/OwnerPage.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AddCarForm from "../components/AddCarForm";
import MyCarManager from "../components/MyCarManager";
import MyRentedCars from "../components/MyRentedCars";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import CarRegistryABI from "../abi/CarRegistry.json";
import dollarIcon from '../assets/dollar.png';
import rentIcon from '../assets/rent.png';
import backIcon from '../assets/back.png';

const OwnerPage = () => {
  const navigate = useNavigate();
  const { signer, account, loading } = useWeb3(true);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [myCars, setMyCars] = useState([]);
  const [selectedTab, setSelectedTab] = useState("add"); // "add" | "list" | "rented"

  const handleCarChange = () => setRefreshSignal((prev) => prev + 1);

  const loadMyCars = async () => {
    if (!signer || !account) return;
    try {
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_REGISTRY,
        CarRegistryABI.abi,
        signer
      );
      const plates = await contract.getCarPlates();
      const result = [];
      for (const plate of plates) {
        const [id, model, location, price, status, renter, owner] =
          await contract.getCar(plate);
        if (owner.toLowerCase() === account.toLowerCase()) {
          result.push({
            plate: id,
            model,
            location,
            price: ethers.formatEther(price),
            status: Number(status),
            renter,
            owner,
          });
        }
      }
      setMyCars(result);
    } catch (err) {
      console.error("❌ 내 차량 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    if (!loading && signer && account) loadMyCars();
  }, [signer, account, refreshSignal]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xl">
        🔄 MetaMask 연결 중...
      </div>
    );

  const totalCars = myCars.length;
  const rentedCars = myCars.filter((c) => c.status === 1).length;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/20 shadow-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-2xl"></span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                차량 소유자 대시보드
              </h1>
              <p className="text-purple-200/80 text-sm">스마트 컨트랙트 기반 차량 관리 시스템</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Enhanced Sidebar */}
          <aside className="xl:w-80 w-full">
            <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              {/* Stats Header */}
              <div className="bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-blue-500/20 p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  실시간 현황
                </h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm p-4 rounded-2xl border border-green-400/20 shadow-lg group hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-200 text-sm font-medium">등록 차량</p>
                        <p className="text-3xl font-bold text-green-400">{totalCars}</p>
                        <p className="text-xs text-green-300">대</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-xl">🚗</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-sm p-4 rounded-2xl border border-yellow-400/20 shadow-lg group hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-200 text-sm font-medium">대여 중</p>
                        <p className="text-3xl font-bold text-yellow-400">{rentedCars}</p>
                        <p className="text-xs text-yellow-300">대</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-xl">
                          <img src={rentIcon} alt="currency" className="w-5 h-5 inline" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-sm p-4 rounded-2xl border border-purple-400/20 shadow-lg group hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-200 text-sm font-medium">총 수익</p>
                        <p className="text-3xl font-bold text-purple-400">-</p>
                        <p className="text-xs text-purple-300">ETH</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-xl">
                          <img src={dollarIcon} alt="currency" className="w-5 h-5 inline" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <span className="text-xl">☰</span>
                  메뉴
                </h3>
                
                <button
                  className={`w-full group flex items-center gap-4 py-4 px-4 rounded-2xl font-medium transition-all duration-300 ${
                    selectedTab === "add" 
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 scale-105" 
                      : "text-purple-200 hover:bg-white/10 hover:text-white hover:scale-102"
                  }`}
                  onClick={() => setSelectedTab("add")}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all ${
                    selectedTab === "add" 
                      ? "bg-white/20" 
                      : "bg-gradient-to-br from-green-500 to-emerald-600 group-hover:scale-110"
                  }`}>
                    <span className="text-lg">➕</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">차량 등록</p>
                    <p className="text-xs opacity-70">새로운 차량 추가</p>
                  </div>
                  {selectedTab === "add" && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>

                <button
                  className={`w-full group flex items-center gap-4 py-4 px-4 rounded-2xl font-medium transition-all duration-300 ${
                    selectedTab === "list" 
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 scale-105" 
                      : "text-purple-200 hover:bg-white/10 hover:text-white hover:scale-102"
                  }`}
                  onClick={() => setSelectedTab("list")}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all ${
                    selectedTab === "list" 
                      ? "bg-white/20" 
                      : "bg-gradient-to-br from-blue-500 to-purple-600 group-hover:scale-110"
                  }`}>
                    <span className="text-lg">🚘</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">등록 차량</p>
                    <p className="text-xs opacity-70">차량 관리 및 수정</p>
                  </div>
                  {totalCars > 0 && (
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {totalCars}
                    </div>
                  )}
                  {selectedTab === "list" && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>

                <button
                  className={`w-full group flex items-center gap-4 py-4 px-4 rounded-2xl font-medium transition-all duration-300 ${
                    selectedTab === "rented" 
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 scale-105" 
                      : "text-purple-200 hover:bg-white/10 hover:text-white hover:scale-102"
                  }`}
                  onClick={() => setSelectedTab("rented")}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all ${
                    selectedTab === "rented" 
                      ? "bg-white/20" 
                      : "bg-gradient-to-br from-yellow-500 to-orange-600 group-hover:scale-110"
                  }`}>
                    <span className="text-xl">
                      
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">대여 현황</p>
                    <p className="text-xs opacity-70">진행 중인 대여</p>
                  </div>
                  {rentedCars > 0 && (
                    <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      {rentedCars}
                    </div>
                  )}
                  {selectedTab === "rented" && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              </div>

              {/* Quick Actions */}
              <div className="p-6 border-t border-white/10">
                <button
                  onClick={() => navigate("/role")}
                  className="w-full bg-gradient-to-r from-gray-600/20 to-gray-700/20 hover:from-gray-500/30 hover:to-gray-600/30 border border-gray-400/20 text-gray-200 hover:text-white py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 font-medium group"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                      <span className="text-sm">
                        <img src={backIcon} alt="currency" className="w-5 h-5 inline" />
                      </span>
                    </div>
                    <span>서비스 변경</span>
                  </div>
                </button>
              </div>
            </div>
          </aside>

          {/* Enhanced Main Content */}
          <main className="flex-1">
            <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl min-h-[600px] overflow-hidden">
              {/* Content Header */}
              <div className="bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-blue-500/10 p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">
                      {selectedTab === "add" ? "➕" : selectedTab === "list" ? "🚘" : ""}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedTab === "add" && "새로운 차량 등록"}
                      {selectedTab === "list" && "등록된 차량 관리"}
                      {selectedTab === "rented" && "대여 현황 모니터링"}
                    </h2>
                    <p className="text-purple-200/80 text-sm mt-1">
                      {selectedTab === "add" && "블록체인에 차량 정보를 등록하고 대여 서비스를 시작하세요"}
                      {selectedTab === "list" && "등록된 차량들의 상태를 확인하고 정보를 수정할 수 있습니다"}
                      {selectedTab === "rented" && "현재 대여 중인 차량들의 상태와 계약 정보를 확인하세요"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Content with Animation */}
              <div className="p-6">
                <div className="animate-fadeIn">
                  {selectedTab === "add" && (
                    <AddCarForm signer={signer} onCarUpdated={handleCarChange} />
                  )}
                  {selectedTab === "list" && (
                    <MyCarManager
                      signer={signer}
                      account={account}
                      refreshSignal={refreshSignal}
                      onCarUpdated={handleCarChange}
                      myCars={myCars}
                    />
                  )}
                  {selectedTab === "rented" && (
                    <MyRentedCars signer={signer} account={account} />
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default OwnerPage;




