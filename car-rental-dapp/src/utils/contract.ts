import { ethers } from "ethers";
import abi from "../artifacts/CarRental.json";  // Compile and place ABI here

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || "";

export const getContract = (provider: ethers.providers.Web3Provider) => {
  return new ethers.Contract(contractAddress, abi, provider.getSigner());
};
