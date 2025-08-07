// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEcoPoints {
    function mint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function transferOwnership(address newOwner) external;
}
// interface IEcoPoints {
//     function mint(address to, uint256 amount) external;
//     function balanceOf(address account) external view returns (uint256);
//     function transferOwnership(address newOwner) external;
// }