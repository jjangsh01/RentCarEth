// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title RentalVault
 * @notice Handles all Ether transfers for rental payments and deposit refunds.
 */
contract RentalVault {
    address public carRentalContract;

    modifier onlyRentalContract() {
        require(msg.sender == carRentalContract, "Unauthorized");
        _;
    }

    constructor() {
        carRentalContract = msg.sender;
    }

    function deposit() external payable onlyRentalContract {}

    function refund(address to, uint256 amount) external onlyRentalContract {
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Refund failed");
    }

    function setRentalContract(address _addr) external {
        carRentalContract = _addr;
    }
}
