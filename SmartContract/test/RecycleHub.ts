import { expect } from "chai";
import { ethers } from "hardhat";
import { RecycleHub, EcoPoints, RecycleNFT, IERC20 } from "../typechain-types";

describe("RecycleHub", function () {
  let recycleHub: RecycleHub;
  let ecoPoints: EcoPoints;
  let recycleNFT: RecycleNFT;
  let cUSD: IERC20;
  let owner: any, collector: any, branch: any, buyer: any;

  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622BC6Cf4699356e0a9a8e0"; // Alfajores cUSD

  beforeEach(async function () {
    [owner, collector, branch, buyer] = await ethers.getSigners();

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
    recycleHub = await RecycleHub.deploy(ecoPoints.address, recycleNFT.address, CUSD_ADDRESS);
    await recycleHub.deployed();

    // Transfer ownership
    await ecoPoints.transferOwnership(recycleHub.address);
    await recycleNFT.transferOwnership(recycleHub.address);

    // Grant roles
    await recycleHub.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("COLLECTOR_ROLE")), collector.address);
    await recycleHub.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BRANCH_ROLE")), branch.address);
    await recycleHub.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BUYER_ROLE")), buyer.address);

    // Mock cUSD for testing (in a real environment, use actual cUSD contract)
    const MockCUSD = await ethers.getContractFactory("MockCUSD");
    cUSD = await MockCUSD.deploy();
    await cUSD.deployed();

    // Fund buyer with mock cUSD
    await cUSD.mint(buyer.address, ethers.utils.parseUnits("1000", 18));
  });

  describe("Role Management", function () {
    it("should allow admin to grant roles", async function () {
      const newCollector = ethers.Wallet.createRandom().address;
      await recycleHub.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("COLLECTOR_ROLE")), newCollector);
      expect(await recycleHub.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("COLLECTOR_ROLE")), newCollector)).to.be.true;
    });

    it("should revert if non-admin tries to grant role", async function () {
      await expect(
        recycleHub.connect(collector).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("COLLECTOR_ROLE")), collector.address)
      ).to.be.revertedWith("AccessControl: account is missing role");
    });
  });

  describe("Material Upload", function () {
    it("should allow collector to upload material", async function () {
      await recycleHub.connect(collector).uploadMaterial(0, 5000, 0); // TransparentPlastic, 5kg, Clean
      const material = await recycleHub.materials(1);
      expect(material.collector).to.equal(collector.address);
      expect(material.materialType).to.equal(0);
      expect(material.weight).to.equal(5000);
      expect(material.quality).to.equal(0);
      expect(material.isVerified).to.be.false;
    });

    it("should revert if weight is zero", async function () {
      await expect(recycleHub.connect(collector).uploadMaterial(0, 0, 0)).to.be.revertedWithCustomError(recycleHub, "InvalidWeight");
    });

    it("should revert if non-collector tries to upload", async function () {
      await expect(recycleHub.connect(buyer).uploadMaterial(0, 5000, 0)).to.be.revertedWith("AccessControl: account is missing role");
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
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("1", 18));
      const material = await recycleHub.materials(1);
      expect(material.isVerified).to.be.true;
      expect(material.quality).to.equal(0);
      expect(material.price).to.equal(ethers.utils.parseUnits("1", 18));
      expect(material.branch).to.equal(branch.address);
    });

    it("should issue eco-points on verification", async function () {
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("1", 18));
      expect(await ecoPoints.balanceOf(collector.address)).to.equal(5); // 5 points for 5kg
    });

    it("should emit MaterialVerified and EcoPointsIssued events", async function () {
      await expect(recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("1", 18)))
        .to.emit(recycleHub, "MaterialVerified")
        .withArgs(1, branch.address, 0, ethers.utils.parseUnits("1", 18))
        .to.emit(recycleHub, "EcoPointsIssued")
        .withArgs(collector.address, 5);
    });

    it("should revert if material does not exist", async function () {
      await expect(recycleHub.connect(branch).verifyMaterial(999, 0, ethers.utils.parseUnits("1", 18)))
        .to.be.revertedWithCustomError(recycleHub, "MaterialNotFound");
    });

    it("should revert if material already verified", async function () {
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("1", 18));
      await expect(recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("1", 18)))
        .to.be.revertedWithCustomError(recycleHub, "MaterialAlreadyVerified");
    });

    it("should revert if price is zero", async function () {
      await expect(recycleHub.connect(branch).verifyMaterial(1, 0, 0))
        .to.be.revertedWithCustomError(recycleHub, "InvalidPrice");
    });
  });

  describe("NFT Minting", function () {
    it("should mint NFT for bulk contributions", async function () {
      await recycleHub.connect(collector).uploadMaterial(0, 100_000, 0); // 100kg
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("10", 18));
      expect(await recycleNFT.ownerOf(1)).to.equal(collector.address);
      await expect(recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("10", 18)))
        .to.emit(recycleHub, "NFTMinted")
        .withArgs(collector.address, 1, 1);
    });

    it("should not mint NFT for non-bulk contributions", async function () {
      await recycleHub.connect(collector).uploadMaterial(0, 50_000, 0); // 50kg
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("5", 18));
      await expect(recycleNFT.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID");
    });
  });

  describe("Payment Processing", function () {
    beforeEach(async function () {
      await recycleHub.connect(collector).uploadMaterial(0, 5000, 0);
      await recycleHub.connect(branch).verifyMaterial(1, 0, ethers.utils.parseUnits("1", 18));
    });

    it("should process payment with cUSD", async function () {
      await cUSD.connect(buyer).approve(recycleHub.address, ethers.utils.parseUnits("1", 18));
      await expect(recycleHub.connect(buyer).processPayment(1))
        .to.emit(recycleHub, "PaymentProcessed")
        .withArgs(collector.address, 1, ethers.utils.parseUnits("1", 18));
      expect(await cUSD.balanceOf(collector.address)).to.equal(ethers.utils.parseUnits("1", 18));
    });

    it("should revert if insufficient funds", async function () {
      await cUSD.connect(buyer).approve(recycleHub.address, ethers.utils.parseUnits("0.5", 18));
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
        .to.be.revertedWith("AccessControl: account is missing role");
    });
  });
});

// Mock cUSD contract for testing
const MockCUSD = {
  type: "contract",
  abi: [
    "function mint(address to, uint256 amount) public",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)",
  ],
  bytecode: {
    object: "0x608060405234801561001057600080fd5b506103e6806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063095ea7b31461005157806340c10f191461006657806370a0823114610085578063a9059cbb146100a5575b600080fd5b61006461005f3660046102e1565b6100c4565b005b6100646100743660046102e1565b6100f2565b61008d61011a565b60405190815260200160405180910390f35b6100646100b33660046102e1565b61012a565b6040516001600160a01b03831690815260208101919091526001600160a01b03166000908152602081905260409020805460ff1916911515919091179055565b6001600160a01b0382166000908152602081905260409020805460ff19166001179055565b60006020819052908152604090205481565b6040516001600160a01b03831690815260208101919091526001600160a01b03166000908152602081905260409020805460ff1916911515919091179055565b80356001600160a01b038116811461015757600080fd5b919050565b600080604083850312156102e157600080fd5b82359150602083013580151581146102f857600080fd5b80915050925092905056fea2646970667358221220f8e2b6b7b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b164736f6c63430008120033",
  },
};