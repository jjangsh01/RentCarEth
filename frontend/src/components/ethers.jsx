import { useEffect, useState } from "react";
import { ethers } from "ethers";
import rentalAbi from "../abi/CarRental.json"; // 경로에 맞게 조정하세요

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_RENTAL;

function OwnerRevenueCard({ account, provider }) {
    const [revenue, setRevenue] = useState("0");

    useEffect(() => {
        const fetchRevenue = async () => {
            if (!account || !provider) return;

            const rentalContract = new ethers.Contract(CONTRACT_ADDRESS, rentalAbi, provider);
            const rawRevenue = await rentalContract.ownerRevenue(account);
            const ethRevenue = ethers.formatEther(rawRevenue); // wei → ETH 변환
            setRevenue(ethRevenue);
        };

        fetchRevenue();
    }, [account, provider]);

    return (
        <div className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-sm p-4 rounded-2xl border border-purple-400/20 shadow-lg group hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-purple-200 text-sm font-medium">총 수익</p>
                    <p className="text-3xl font-bold text-purple-400">{revenue}</p>
                    <p className="text-xs text-purple-300">ETH</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <img src={dollarIcon} alt="currency" className="w-5 h-5 inline" />
                </div>
            </div>
        </div>
    );
}

export default OwnerRevenueCard;
