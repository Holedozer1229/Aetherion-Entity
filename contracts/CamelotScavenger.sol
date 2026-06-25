// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CamelotScavenger is ERC20, Ownable {
    bytes32 public constant MNEMONIC_HASH = keccak256(
        "sword legend pull magic king arthur stone destiny forge fire steel honor quest"
    );

    uint256 public constant TOTAL_SUPPLY   = 29_000_000 * 10**18;
    uint256 public constant GENESIS_MINT   =  7_500_000 * 10**18;
    uint256 public constant REMAINING_MINT = TOTAL_SUPPLY - GENESIS_MINT;
    uint256 public constant PER_SOLVER_MINT =     1000 * 10**18;

    uint256 public mintedBySolvers;
    mapping(address => bool) public hasMinted;

    constructor() ERC20("Camelot Excalibur", "EXCAL") Ownable(msg.sender) {
        _mint(msg.sender, GENESIS_MINT);
    }

    function mintByMnemonic(string calldata mnemonic) external {
        require(!hasMinted[msg.sender], "Already minted");
        require(keccak256(bytes(mnemonic)) == MNEMONIC_HASH, "Wrong mnemonic");
        require(mintedBySolvers + PER_SOLVER_MINT <= REMAINING_MINT, "Pool exhausted");
        _mint(msg.sender, PER_SOLVER_MINT);
        mintedBySolvers += PER_SOLVER_MINT;
        hasMinted[msg.sender] = true;
    }
}