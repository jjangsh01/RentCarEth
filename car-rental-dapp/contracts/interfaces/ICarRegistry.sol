// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ICarRegistry {
    enum CarStatus { Available, Rented, Maintenance }

    
    function getCar(string memory plateNumber) external view returns (
        string memory, // plateNumber
        string memory, // model
        string memory, // location
        uint256,       // pricePerDay
        uint8,         // status
        address,       // renter
        address        // owner <-- 새 필드
    );

    function setCarRented(string memory plateNumber, address renter) external;
    function setCarAvailable(string memory plateNumber) external;
}
