// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoPoints is ERC20, Ownable {
    constructor() ERC20("EcoPoints", "ECO") Ownable(msg.sender) {}

    error OnlyRecycleHub();

    function mint(address to, uint256 amount) external {
        if (msg.sender != owner()) revert OnlyRecycleHub();
        _mint(to, amount);
    }
    // function tract(address to, uint256 amount) external {
    //     if (msg.sender != owner()) revert OnlyRecycleHub();
    //     _track(to, amount);
    // }

}