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

  // Deploy RecycleHub with cUSD address as bytes32 to bypass checksum validation
  const cUSDAddressBytes = "0x000000000000000000000000874069fa1eb16d44d622bc6cf4699356e0a9a8e0";
  const RecycleHub = await ethers.getContractFactory("RecycleHub");
  
  // Convert bytes32 back to address in the contract
  const recycleHub = await RecycleHub.deploy(
    await ecoPoints.getAddress(), 
    await recycleNFT.getAddress(), 
    "0x874069fa1eb16d44d622bc6cf4699356e0a9a8e0" // Use lowercase address
  );
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
    cUSD: "0x874069fa1eb16d44d622bc6cf4699356e0a9a8e0",
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});