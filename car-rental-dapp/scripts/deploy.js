// scripts/deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const envPath = path.resolve(__dirname, "../../frontend/.env");
const frontendAbiPath = path.resolve(__dirname, "../../frontend/src/abi");

async function updateEnv(key, value) {
  let envContent = "";
  try {
    envContent = fs.readFileSync(envPath, "utf8");
  } catch (err) {
    console.error("❗ .env 파일을 찾을 수 없습니다. 새로 생성합니다.");
  }

  const regex = new RegExp(`${key}=.*`);
  if (envContent.match(regex)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }

  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ ${key}를 .env에 업데이트했습니다.`);
  } catch (err) {
    console.error("❌ .env 파일 업데이트 실패:", err);
  }
}

async function saveAbi(contractName) {
  try {
    const artifact = await hre.artifacts.readArtifact(contractName);

    if (!fs.existsSync(frontendAbiPath)) {
      fs.mkdirSync(frontendAbiPath, { recursive: true });
    }

    const abiFilePath = path.join(frontendAbiPath, `${contractName}.json`);
    fs.writeFileSync(abiFilePath, JSON.stringify(artifact, null, 2));
    console.log(`✅ ${contractName} ABI 파일을 저장했습니다: ${abiFilePath}`);
  } catch (err) {
    console.error(`❌ ${contractName} ABI 저장 실패:`, err);
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 배포자 주소:", deployer.address);

  // ✅ CarRegistry 배포 (관리자 없이)
  const CarRegistry = await ethers.getContractFactory("CarRegistry");
  const carRegistry = await CarRegistry.deploy();
  await carRegistry.waitForDeployment();
  console.log("🚗 CarRegistry 배포 완료:", carRegistry.target);
  await updateEnv("VITE_CONTRACT_REGISTRY", carRegistry.target);
  await saveAbi("CarRegistry");

  // ✅ KYCManager 배포 (admin은 여전히 필요)
  const KYCManager = await ethers.getContractFactory("KYCManager");
  const kycManager = await KYCManager.deploy(deployer.address);
  await kycManager.waitForDeployment();
  console.log("🔐 KYCManager 배포 완료:", kycManager.target);
  await updateEnv("VITE_CONTRACT_KYC", kycManager.target);
  await saveAbi("KYCManager");

  // ✅ RentalVault 배포
  const RentalVault = await ethers.getContractFactory("RentalVault");
  const rentalVault = await RentalVault.deploy();
  await rentalVault.waitForDeployment();
  console.log("🏦 RentalVault 배포 완료:", rentalVault.target);
  await updateEnv("VITE_CONTRACT_VAULT", rentalVault.target);
  await saveAbi("RentalVault");

  // ✅ CarRental 배포
  const CarRental = await ethers.getContractFactory("CarRental");
  const carRental = await CarRental.deploy(
    carRegistry.target,
    kycManager.target,
    rentalVault.target
  );
  await carRental.waitForDeployment();
  console.log("🚙 CarRental 배포 완료:", carRental.target);
  await updateEnv("VITE_CONTRACT_RENTAL", carRental.target);
  await saveAbi("CarRental");

  // 🔗 RentalVault 연결
  try {
    const tx = await rentalVault.setRentalContract(carRental.target);
    await tx.wait();
    console.log("🔗 RentalVault와 CarRental 연결 완료");
  } catch (err) {
    console.error("❌ RentalVault 링크 실패:", err);
  }
}

main().catch((error) => {
  console.error("🚨 배포 중 오류:", error);
  process.exitCode = 1;
});








