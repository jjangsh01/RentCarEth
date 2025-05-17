const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // CarRegistry
  const CarRegistry = await ethers.getContractFactory("CarRegistry");
  const carRegistry = await CarRegistry.deploy();
  await carRegistry.waitForDeployment(); // ✅ v6 syntax
  console.log("CarRegistry deployed at:", carRegistry.target);

  // KYCManager
  const KYCManager = await ethers.getContractFactory("KYCManager");
  const kycManager = await KYCManager.deploy();
  await kycManager.waitForDeployment();
  console.log("KYCManager deployed at:", kycManager.target);

  // RentalVault
  const RentalVault = await ethers.getContractFactory("RentalVault");
  const rentalVault = await RentalVault.deploy();
  await rentalVault.waitForDeployment();
  console.log("RentalVault deployed at:", rentalVault.target);

  // CarRental
  const CarRental = await ethers.getContractFactory("CarRental");
  const carRental = await CarRental.deploy(
    carRegistry.target,
    kycManager.target,
    rentalVault.target
  );
  await carRental.waitForDeployment();
  console.log("CarRental deployed at:", carRental.target);

  // Link RentalVault to CarRental
  try {
    const tx = await rentalVault.setRentalContract(carRental.target);
    await tx.wait();
    console.log("RentalVault linked to CarRental");
  } catch (err) {
    if (err.message.includes("Already set")) {
      console.log("RentalVault was already initialized, skipping.");
    } else {
      throw err;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


