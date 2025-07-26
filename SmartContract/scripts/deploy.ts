import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy EcoPoints
  const EcoPoints = await ethers.getContractFactory("EcoPoints");
  const ecoPoints = await EcoPoints.deploy();
  // await ecoPoints.deployed();
  console.log("EcoPoints deployed to:", await ecoPoints.getAddress());

  // Deploy RecycleNFT
  const RecycleNFT = await ethers.getContractFactory("RecycleNFT");
  const recycleNFT = await RecycleNFT.deploy();
  // await recycleNFT.deployed();
  console.log("RecycleNFT deployed to:", await recycleNFT.getAddress());

  // Deploy RecycleHub
  const cUSDAddress = "0x874069Fa1Eb16D44d622BC6Cf4699356e0a9a8e0"; // Alfajores cUSD
  const RecycleHub = await ethers.getContractFactory("RecycleHub");
  const recycleHub = await RecycleHub.deploy(await ecoPoints.getAddress(), await recycleNFT.getAddress(), cUSDAddress);
  // await recycleHub.deployed();
  console.log("RecycleHub deployed to:", await recycleHub.getAddress());

  // Transfer ownership
  await ecoPoints.transferOwnership(await recycleHub.getAddress());
  await recycleNFT.transferOwnership(await recycleHub.getAddress());
  console.log("Ownership transferred to RecycleHub");

  console.log({
    EcoPoints: await ecoPoints.getAddress(),
    RecycleNFT: await recycleNFT.getAddress(),
    RecycleHub: await recycleHub.getAddress(),
    cUSD: cUSDAddress,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});