import { ethers } from "hardhat";

async function main() {
  const recycleHubAddress = "0xYourDeployedContractAddress"; // Update after deployment
  const RecycleHub = await ethers.getContractFactory("RecycleHub");
  const recycleHub = await ethers.getContractAt(RecycleHub.interface, recycleHubAddress);

  const testCollector = "0xTestCollectorAddress";
  const testBranch = "0xTestBranchAddress";
  const testBuyer = "0xTestBuyerAddress";

  await recycleHub.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("COLLECTOR_ROLE")), testCollector);
  await recycleHub.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BRANCH_ROLE")), testBranch);
  await recycleHub.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BUYER_ROLE")), testBuyer);

  console.log("Roles granted:", { testCollector, testBranch, testBuyer });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});