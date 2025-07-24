// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Interfaces/IEcoPoints.sol";
import "./Interfaces/IRecycleNFT.sol";
import "./Interfaces/IRecycleHub.sol";
import "./libraries/MaterialLib.sol";

contract RecycleHub is AccessControl, IRecycleHub {
    bytes32 public constant COLLECTOR_ROLE = keccak256("COLLECTOR_ROLE");
    bytes32 public constant BRANCH_ROLE = keccak256("BRANCH_ROLE");
    bytes32 public constant BUYER_ROLE = keccak256("BUYER_ROLE");

    IEcoPoints public immutable ecoPoints;
    IRecycleNFT public immutable recycleNFT;
    IERC20 public immutable paymentToken; // cUSD on Celo
    uint256 public constant MIN_BULK_WEIGHT = 100_000; // 100kg in grams

    mapping(uint256 => Material) private _materials;
    uint256 private _materialCounter;

    error MaterialNotFound(uint256 id);
    error MaterialAlreadyVerified(uint256 id);
    error InsufficientFunds(uint256 required, uint256 available);
    error UnauthorizedRole();
    error InvalidWeight(uint256 weight);
    error InvalidPrice(uint256 price);

    constructor(address _ecoPoints, address _recycleNFT, address _paymentToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        ecoPoints = IEcoPoints(_ecoPoints);
        recycleNFT = IRecycleNFT(_recycleNFT);
        paymentToken = IERC20(_paymentToken);
    }

    function materials(uint256 id) public view override returns (Material memory) {
        return _materials[id];
    }

    function materialCounter() public view override returns (uint256) {
        return _materialCounter;
    }

    function uploadMaterial(
        MaterialLib.MaterialType _materialType,
        uint256 _weight,
        MaterialLib.Quality _quality
    ) external override onlyRole(COLLECTOR_ROLE) {
        if (_weight == 0) revert InvalidWeight(_weight);
        _materialCounter++;
        _materials[_materialCounter] = Material({
            id: _materialCounter,
            collector: msg.sender,
            materialType: _materialType,
            weight: _weight,
            quality: _quality,
            isVerified: false,
            price: 0,
            branch: address(0)
        });
        emit MaterialUploaded(_materialCounter, msg.sender, _materialType, _weight);
    }

    function verifyMaterial(uint256 _materialId, MaterialLib.Quality _quality, uint256 _price)
        external
        override
        onlyRole(BRANCH_ROLE)
    {
        Material storage material = _materials[_materialId];
        if (material.id == 0) revert MaterialNotFound(_materialId);
        if (material.isVerified) revert MaterialAlreadyVerified(_materialId);
        if (_price == 0) revert InvalidPrice(_price);

        material.isVerified = true;
        material.quality = _quality;
        material.price = _price;
        material.branch = msg.sender;

        // Issue eco-points (1 point per kg)
        uint256 points = material.weight / 1000;
        ecoPoints.mint(material.collector, points);
        emit EcoPointsIssued(material.collector, points);

        // Mint NFT for bulk contributions (>= 100kg)
        if (material.weight >= MIN_BULK_WEIGHT) {
            uint256 tokenId = recycleNFT.mint(material.collector, _materialId);
            emit NFTMinted(material.collector, tokenId, _materialId);
        }

        emit MaterialVerified(_materialId, msg.sender, _quality, _price);
    }

    function processPayment(uint256 _materialId) external override onlyRole(BUYER_ROLE) {
        Material storage material = _materials[_materialId];
        if (material.id == 0) revert MaterialNotFound(_materialId);
        if (!material.isVerified) revert MaterialAlreadyVerified(_materialId);
        if (material.price == 0) revert InvalidPrice(material.price);

        uint256 balance = paymentToken.balanceOf(msg.sender);
        if (balance < material.price) revert InsufficientFunds(material.price, balance);

        require(paymentToken.transferFrom(msg.sender, material.collector, material.price), "Payment failed");
        emit PaymentProcessed(material.collector, _materialId, material.price);
    }

    function grantRole(bytes32 role, address account) public override(AccessControl, IRecycleHub) onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
    }
}