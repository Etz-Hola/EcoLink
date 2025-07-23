import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy EcoPoints
  const EcoPoints = await ethers.getContractFactory("EcoPoints");
  const ecoPoints = await EcoPoints.deploy();
  await ecoPoints.deployed();
  console.log("EcoPoints deployed to:", ecoPoints.address);

  // Deploy RecycleNFT
  const RecycleNFT = await ethers.getContractFactory("RecycleNFT");
  const recycleNFT = await RecycleNFT.deploy();
  await recycleNFT.deployed();
  console.log("RecycleNFT deployed to:", recycleNFT.address);

  // Deploy RecycleHub
  const cUSDAddress = "0x874069Fa1Eb16D44d622BC6Cf4699356e0a9a8e0"; // Alfajores cUSD
  const RecycleHub = await ethers.getContractFactory("RecycleHub");
  const recycleHub = await RecycleHub.deploy(ecoPoints.address, recycleNFT.address, cUSDAddress);
  await recycleHub.deployed();
  console.log("RecycleHub deployed to:", recycleHub.address);

  // Transfer ownership
  await ecoPoints.transferOwnership(recycleHub.address);
  await recycleNFT.transferOwnership(recycleHub.address);
  console.log("Ownership transferred to RecycleHub");

  console.log({
    EcoPoints: ecoPoints.address,
    RecycleNFT: recycleNFT.address,
    RecycleHub: recycleHub.address,
    cUSD: cUSDAddress,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});