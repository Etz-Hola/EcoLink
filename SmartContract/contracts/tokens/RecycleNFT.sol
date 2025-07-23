// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RecycleNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    constructor() ERC721("RecycleNFT", "RNFT") Ownable(msg.sender) {}

    error OnlyRecycleHub();

    function mint(address to, uint256 materialId) external returns (uint256) {
        if (msg.sender != owner()) revert OnlyRecycleHub();
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _mint(to, tokenId);
        return tokenId;
    }
}