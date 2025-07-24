import { expect } from "chai";
import { ethers } from "hardhat";
import { EcoPoints, RecycleNFT, RecycleHub, MockCUSD } from "../typechain-types";

describe("EcoPoints and RecycleNFT", function () {
  let ecoPoints: EcoPoints;
  let recycleNFT: RecycleNFT;
  let recycleHub: RecycleHub;
  let cUSD: MockCUSD;
  let owner: any, collector: any, branch: any, other: any;

  beforeEach(async function () {
    [owner, collector, branch, other] = await ethers.getSigners();

    // Deploy MockCUSD
    const MockCUSD = await ethers.getContractFactory("MockCUSD");
    cUSD = await MockCUSD.deploy();
    await cUSD.deployed();

    // Deploy EcoPoints
    const EcoPoints = await ethers.getContractFactory("EcoPoints");
    ecoPoints = await EcoPoints.deploy();
    await ecoPoints.deployed();

    // Deploy RecycleNFT
    const RecycleNFT = await ethers.getContractFactory("RecycleNFT");
    recycleNFT = await RecycleNFT.deploy();
    await recycleNFT.deployed();

    // Deploy RecycleHub
    const RecycleHub = await ethers.getContractFactory("RecycleHub");
    recycleHub = await RecycleHub.deploy(ecoPoints.address, recycleNFT.address, cUSD.address);
    await recycleHub.deployed();

    // Transfer ownership to RecycleHub
    await ecoPoints.transferOwnership(recycleHub.address);
    await recycleNFT.transferOwnership(recycleHub.address);

    // Grant roles for RecycleHub
    await recycleHub.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("COLLECTOR_ROLE")), collector.address);
    await recycleHub.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BRANCH_ROLE")), branch.address);
  });

  describe("EcoPoints", function () {
    describe("Minting", function () {
      it("should allow RecycleHub to mint eco-points", async function () {
        // Simulate RecycleHub minting via verifyMaterial
        await recycleHub.connect(collector).uploadMaterial(0, 5000, 0); // 5kg
        await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("1", 18));
        expect(await ecoPoints.balanceOf(collector.address)).to.equal(5); // 5 points for 5kg
      });

      it("should revert if non-owner tries to mint", async function () {
        await expect(ecoPoints.connect(other).mint(collector.address, 100))
          .to.be.revertedWithCustomError(ecoPoints, "OnlyRecycleHub");
      });

      it("should emit Transfer event on mint", async function () {
        await recycleHub.connect(collector).uploadMaterial(0, 5000, 0);
        await expect(recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("1", 18)))
          .to.emit(ecoPoints, "Transfer")
          .withArgs(ethers.constants.AddressZero, collector.address, 5);
      });
    });

    describe("Ownership", function () {
      it("should have RecycleHub as owner", async function () {
        expect(await ecoPoints.owner()).to.equal(recycleHub.address);
      });

      it("should allow owner to transfer ownership", async function () {
        // Deploy a new EcoPoints contract for this test
        const EcoPoints = await ethers.getContractFactory("EcoPoints");
        const newEcoPoints = await EcoPoints.deploy();
        await newEcoPoints.deployed();
        await newEcoPoints.transferOwnership(recycleHub.address);
        expect(await newEcoPoints.owner()).to.equal(recycleHub.address);
      });

      it("should revert if non-owner tries to transfer ownership", async function () {
        await expect(ecoPoints.connect(other).transferOwnership(other.address))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("ERC20 Standard Functions", function () {
      beforeEach(async function () {
        // Mint 100 points to collector via RecycleHub
        await recycleHub.connect(collector).uploadMaterial(0, 100_000, 0); // 100kg
        await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("10", 18));
      });

      it("should return correct balance", async function () {
        expect(await ecoPoints.balanceOf(collector.address)).to.equal(100); // 100 points
      });

      it("should allow transfer of eco-points", async function () {
        await ecoPoints.connect(collector).transfer(other.address, 50);
        expect(await ecoPoints.balanceOf(collector.address)).to.equal(50);
        expect(await ecoPoints.balanceOf(other.address)).to.equal(50);
      });

      it("should revert if transfer exceeds balance", async function () {
        await expect(ecoPoints.connect(collector).transfer(other.address, 101))
          .to.be.revertedWith("ERC20: transfer amount exceeds balance");
      });
    });
  });

  describe("RecycleNFT", function () {
    describe("Minting", function () {
      it("should allow RecycleHub to mint NFT for bulk contributions", async function () {
        await recycleHub.connect(collector).uploadMaterial(0, 100_000, 0); // 100kg
        await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("10", 18));
        expect(await recycleNFT.ownerOf(1)).to.equal(collector.address);
      });

      it("should not mint NFT for non-bulk contributions", async function () {
        await recycleHub.connect(collector).uploadMaterial(0, 50_000, 0); // 50kg
        await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("5", 18));
        await expect(recycleNFT.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
      });

      it("should revert if non-owner tries to mint", async function () {
        await expect(recycleNFT.connect(other).mint(collector.address, 1))
          .to.be.revertedWithCustomError(recycleNFT, "OnlyRecycleHub");
      });

      it("should emit Transfer event on mint", async function () {
        await recycleHub.connect(collector).uploadMaterial(0, 100_000, 0);
        await expect(recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("10", 18)))
          .to.emit(recycleNFT, "Transfer")
          .withArgs(ethers.constants.AddressZero, collector.address, 1);
      });
    });

    describe("Ownership", function () {
      it("should have RecycleHub as owner", async function () {
        expect(await recycleNFT.owner()).to.equal(recycleHub.address);
      });

      it("should allow owner to transfer ownership", async function () {
        // Deploy a new RecycleNFT contract for this test
        const RecycleNFT = await ethers.getContractFactory("RecycleNFT");
        const newRecycleNFT = await RecycleNFT.deploy();
        await newRecycleNFT.deployed();
        await newRecycleNFT.transferOwnership(recycleHub.address);
        expect(await newRecycleNFT.owner()).to.equal(recycleHub.address);
      });

      it("should revert if non-owner tries to transfer ownership", async function () {
        await expect(recycleNFT.connect(other).transferOwnership(other.address))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("ERC721 Standard Functions", function () {
      beforeEach(async function () {
        // Mint NFT to collector via RecycleHub
        await recycleHub.connect(collector).uploadMaterial(0, 100_000, 0);
        await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("10", 18));
      });

      it("should return correct owner of NFT", async function () {
        expect(await recycleNFT.ownerOf(1)).to.equal(collector.address);
      });

      it("should allow transfer of NFT", async function () {
        await recycleNFT.connect(collector).transferFrom(collector.address, other.address, 1);
        expect(await recycleNFT.ownerOf(1)).to.equal(other.address);
      });

      it("should revert if transfer of non-existent token", async function () {
        await expect(recycleNFT.connect(collector).transferFrom(collector.address, other.address, 999))
          .to.be.revertedWith("ERC721: invalid token ID");
      });

      it("should increment tokenId correctly", async function () {
        await recycleHub.connect(collector).uploadMaterial(0, 200_000, 0); // Another 200kg
        await recycleHub.connect(branch).verifyMaterial(2, 0, ethers.utils.parseUnits("20", 18));
        expect(await recycleNFT.ownerOf(2)).to.equal(collector.address);
      });
    });
  });
});