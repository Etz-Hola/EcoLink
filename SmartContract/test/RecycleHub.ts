import { expect } from "chai";
import { ethers } from "hardhat";
import { RecycleHub, EcoPoints, RecycleNFT, MockCUSD } from "../typechain-types";

describe("RecycleHub", function () {
  let recycleHub: RecycleHub;
  let ecoPoints: EcoPoints;
  let recycleNFT: RecycleNFT;
  let cUSD: MockCUSD;
  let owner: any, collector: any, branch: any, buyer: any;

  beforeEach(async function () {
    [owner, collector, branch, buyer] = await ethers.getSigners();

    // Deploy MockCUSD
    const MockCUSD = await ethers.getContractFactory("MockCUSD");
    cUSD = await MockCUSD.deploy();
    // await cUSD.deployed();

    // Deploy EcoPoints
    const EcoPoints = await ethers.getContractFactory("EcoPoints");
    ecoPoints = await EcoPoints.deploy();
    // await ecoPoints.deployed();

    // Deploy RecycleNFT
    const RecycleNFT = await ethers.getContractFactory("RecycleNFT");
    recycleNFT = await RecycleNFT.deploy();
    // await recycleNFT.deployed();

    // Deploy RecycleHub
    const RecycleHub = await ethers.getContractFactory("RecycleHub");
    recycleHub = await RecycleHub.deploy(ecoPoints.getAddress(), recycleNFT.getAddress(), cUSD.getAddress());
    // await recycleHub.deployed();

    // Transfer ownership
    await ecoPoints.transferOwnership(await recycleHub.getAddress());
    await recycleNFT.transferOwnership(await recycleHub.getAddress());

    // Grant roles
    await recycleHub.grantRole(ethers.keccak256(ethers.toUtf8Bytes("COLLECTOR_ROLE")), collector.address);
    await recycleHub.grantRole(ethers.keccak256(ethers.toUtf8Bytes("BRANCH_ROLE")), branch.address);
    await recycleHub.grantRole(ethers.keccak256(ethers.toUtf8Bytes("BUYER_ROLE")), buyer.address);

    // Fund buyer with cUSD
    await cUSD.mint(buyer.address, ethers.parseUnits("1000", 18));
  });

  describe("Role Management", function () {
    it("should allow admin to grant roles", async function () {
      const newCollector = ethers.Wallet.createRandom().address;
      await recycleHub.grantRole(ethers.keccak256(ethers.toUtf8Bytes("COLLECTOR_ROLE")), newCollector);
      expect(await recycleHub.hasRole(ethers.keccak256(ethers.toUtf8Bytes("COLLECTOR_ROLE")), newCollector)).to.be.true;
    });

    it("should revert if non-admin tries to grant role", async function () {
      await expect(
        recycleHub.connect(collector).grantRole(ethers.keccak256(ethers.toUtf8Bytes("COLLECTOR_ROLE")), collector.address)
      ).to.be.revertedWithCustomError(recycleHub, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Material Upload", function () {
    it("should allow collector to upload material", async function () {
      await recycleHub.connect(collector).uploadMaterial(0, 5000, 0);
      const material = await recycleHub.materials(1);
      expect(material.collector).to.equal(collector.address);
      expect(material.materialType).to.equal(0);
      expect(material.weight).to.equal(5000);
      expect(material.quality).to.equal(0);
      expect(material.isVerified).to.be.false;
      expect(await recycleHub.materialCounter()).to.equal(1);
    });

    it("should revert if weight is zero", async function () {
      await expect(recycleHub.connect(collector).uploadMaterial(0, 0, 0))
        .to.be.revertedWithCustomError(recycleHub, "InvalidWeight");
    });

    it("should revert if non-collector tries to upload", async function () {
      await expect(recycleHub.connect(buyer).uploadMaterial(0, 5000, 0))
        .to.be.revertedWithCustomError(recycleHub, "AccessControlUnauthorizedAccount");
    });

    it("should emit MaterialUploaded event", async function () {
      await expect(recycleHub.connect(collector).uploadMaterial(0, 5000, 0))
        .to.emit(recycleHub, "MaterialUploaded")
        .withArgs(1, collector.address, 0, 5000);
    });
  });

  describe("Material Verification", function () {
    beforeEach(async function () {
      await recycleHub.connect(collector).uploadMaterial(0, 5000, 0);
    });

    it("should allow branch to verify material", async function () {
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.parseUnits("1", 18));
      const material = await recycleHub.materials(1);
      expect(material.isVerified).to.be.true;
      expect(material.quality).to.equal(0);
      expect(material.price).to.equal(ethers.parseUnits("1", 18));
      expect(material.branch).to.equal(branch.address);
    });

    it("should issue eco-points on verification", async function () {
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.parseUnits("1", 18));
      expect(await ecoPoints.balanceOf(collector.address)).to.equal(5);
    });

    it("should emit MaterialVerified and EcoPointsIssued events", async function () {
      await expect(recycleHub.connect(branch).verifyMaterial(1, 0, ethers.parseUnits("1", 18)))
        .to.emit(recycleHub, "MaterialVerified")
        .withArgs(1, branch.address, 0, ethers.parseUnits("1", 18))
        .to.emit(recycleHub, "EcoPointsIssued")
        .withArgs(collector.address, 5);
    });

    it("should revert if material does not exist", async function () {
      await expect(recycleHub.connect(branch).verifyMaterial(999, 0, ethers.parseUnits("1", 18)))
        .to.be.revertedWithCustomError(recycleHub, "MaterialNotFound");
    });

    it("should revert if material already verified", async function () {
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.parseUnits("1", 18));
      await expect(recycleHub.connect(branch).verifyMaterial(1, 0, ethers.parseUnits("1", 18)))
        .to.be.revertedWithCustomError(recycleHub, "MaterialAlreadyVerified");
    });

    it("should revert if price is zero", async function () {
      await expect(recycleHub.connect(branch).verifyMaterial(1, 0, 0))
        .to.be.revertedWithCustomError(recycleHub, "InvalidPrice");
    });
  });

  describe("NFT Minting", function () {
    it("should mint NFT for bulk contributions", async function () {
      await recycleHub.connect(collector).uploadMaterial(0, 100_000, 0);
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.parseUnits("10", 18));
      expect(await recycleNFT.ownerOf(1)).to.equal(collector.address);
      // Try to verify again, should revert with MaterialAlreadyVerified
      await expect(recycleHub.connect(branch).verifyMaterial(1, 0, ethers.parseUnits("10", 18)))
        .to.be.revertedWithCustomError(recycleHub, "MaterialAlreadyVerified");
    });

    it("should not mint NFT for non-bulk contributions", async function () {
      await recycleHub.connect(collector).uploadMaterial(0, 50_000, 0);
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.parseUnits("5", 18));
      await expect(recycleNFT.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
    });
  });

  describe("Payment Processing", function () {
    beforeEach(async function () {
      await recycleHub.connect(collector).uploadMaterial(0, 5000, 0);
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.parseUnits("1", 18));
    });

    it("should process payment with cUSD", async function () {
      await cUSD.connect(buyer).approve(recycleHub.getAddress(), ethers.parseUnits("1", 18));
      await expect(recycleHub.connect(buyer).processPayment(1))
        .to.emit(recycleHub, "PaymentProcessed")
        .withArgs(collector.address, 1, ethers.parseUnits("1", 18));
      expect(await cUSD.balanceOf(collector.address)).to.equal(ethers.parseUnits("1", 18));
    });

    it("should revert if insufficient funds", async function () {
      await cUSD.connect(buyer).approve(recycleHub.getAddress(), ethers.parseUnits("0.5", 18));
      await expect(recycleHub.connect(buyer).processPayment(1))
        .to.be.revertedWithCustomError(recycleHub, "InsufficientFunds");
    });

    it("should revert if material not verified", async function () {
      await recycleHub.connect(collector).uploadMaterial(0, 5000, 0);
      await expect(recycleHub.connect(buyer).processPayment(2))
        .to.be.revertedWithCustomError(recycleHub, "MaterialAlreadyVerified");
    });

    it("should revert if non-buyer tries to process payment", async function () {
      await expect(recycleHub.connect(collector).processPayment(1))
        .to.be.revertedWithCustomError(recycleHub, "AccessControlUnauthorizedAccount");
    });
  });
});