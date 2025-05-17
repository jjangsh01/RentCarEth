// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ICarRegistry {
    enum CarStatus { Available, Rented, Maintenance }

    struct Car {
        uint256 id;
        string model;
        string location;
        uint256 pricePerDay;
        CarStatus status;
        address renter;
    }

    function getCar(uint256 carId) external view returns (
        uint256 id,
        string memory model,
        string memory location,
        uint256 pricePerDay,
        uint8 status,
        address renter
    );

    function nextCarId() external view returns (uint256);
    function setCarRented(uint256 carId, address renter) external;
    function setCarAvailable(uint256 carId) external;
    function setCarMaintenance(uint256 carId) external;
}
