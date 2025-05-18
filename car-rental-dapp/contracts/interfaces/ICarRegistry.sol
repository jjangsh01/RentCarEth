// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ICarRegistry {
    enum CarStatus { Available, Rented, Maintenance }


    function getCar(string memory plateNumber) external view returns (
        string memory, string memory, string memory, uint256, uint8, address
    );

    function setCarRented(string memory plateNumber, address renter) external;
    function setCarAvailable(string memory plateNumber) external;
}


