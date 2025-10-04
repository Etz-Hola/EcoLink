// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRecycleNFT {
    function mint(address to, uint256 materialId) external returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferOwnership(address newOwner) external;
    // function setBaseURI(string memory ba)
}