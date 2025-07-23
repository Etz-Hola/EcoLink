// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/MaterialLib.sol";

interface IRecycleHub {
    struct Material {
        uint256 id;
        address collector;
        MaterialLib.MaterialType materialType;
        uint256 weight; // in grams
        MaterialLib.Quality quality;
        bool isVerified;
        uint256 price; // in cUSD (wei)
        address branch;
    }

    function uploadMaterial(
        MaterialLib.MaterialType materialType,
        uint256 weight,
        MaterialLib.Quality quality
    ) external;

    function verifyMaterial(uint256 materialId, MaterialLib.Quality quality, uint256 price) external;

    function processPayment(uint256 materialId) external;

    function grantRole(bytes32 role, address account) external;

    function materials(uint256 id) external view returns (Material memory);

    function materialCounter() external view returns (uint256);

    event MaterialUploaded(uint256 indexed id, address indexed collector, MaterialLib.MaterialType materialType, uint256 weight);
    event MaterialVerified(uint256 indexed id, address indexed branch, MaterialLib.Quality quality, uint256 price);
    event EcoPointsIssued(address indexed collector, uint256 points);
    event NFTMinted(address indexed collector, uint256 tokenId, uint256 materialId);
    event PaymentProcessed(address indexed collector, uint256 materialId, uint256 amount);
}