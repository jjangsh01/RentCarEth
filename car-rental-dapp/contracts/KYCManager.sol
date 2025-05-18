// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract KYCManager {
    address public admin;
    mapping(address => bool) public approvedUsers;

    event KYCRequested(address indexed user);
    event KYCRevoked(address indexed user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor(address _admin) {
        admin = _admin;  // ✅ 배포 시 설정한 관리자 주소
    }

    // ✅ 사용자가 직접 KYC 신청
    function requestKYC() external {
        require(!approvedUsers[msg.sender], "Already approved");
        approvedUsers[msg.sender] = true;
        emit KYCRequested(msg.sender);
    }

    // ✅ KYC 상태 확인
    function checkKYC(address user) external view returns (bool) {
        return approvedUsers[user];
    }

    // ✅ 관리자 주소 확인
    function isAdmin(address user) external view returns (bool) {
        return user == admin;
    }

    // 🛠️ 관리자가 KYC 승인 철회
    function revokeKYC(address user) external onlyAdmin {
        require(approvedUsers[user], "User not approved");
        approvedUsers[user] = false;
        emit KYCRevoked(user);
    }
}