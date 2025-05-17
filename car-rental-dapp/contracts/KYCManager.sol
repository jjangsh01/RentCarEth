// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title KYCManager
 * @notice Manages user verification for rental eligibility.
 */
contract KYCManager {
    address public admin;

    mapping(address => bool) public isKYCApproved;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function approveKYC(address user) external onlyAdmin {
        isKYCApproved[user] = true;
    }

    function revokeKYC(address user) external onlyAdmin {
        isKYCApproved[user] = false;
    }

    function checkKYC(address user) external view returns (bool) {
        return isKYCApproved[user];
    }
}
