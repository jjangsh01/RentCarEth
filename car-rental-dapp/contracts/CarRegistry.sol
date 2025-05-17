// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/ICarRegistry.sol";

/**
 * @title CarRegistry
 * @notice Manages car data and status (Available, Rented, Maintenance)
 */
contract CarRegistry is ICarRegistry {
    address public owner;

    mapping(uint256 => Car) private cars;
    uint256 public override nextCarId;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCar(
        string calldata model,
        string calldata location,
        uint256 pricePerDay
    ) external onlyOwner {
        cars[nextCarId] = Car({
            id: nextCarId,
            model: model,
            location: location,
            pricePerDay: pricePerDay,
            status: CarStatus.Available,
            renter: address(0)
        });
        nextCarId++;
    }

    function getCar(uint256 carId) external view override returns (
        uint256,
        string memory,
        string memory,
        uint256,
        uint8,
        address
    ) {
        Car storage car = cars[carId];
        return (
            car.id,
            car.model,
            car.location,
            car.pricePerDay,
            uint8(car.status),
            car.renter
        );
    }

    function setCarRented(uint256 carId, address renter) external override {
        Car storage car = cars[carId];
        require(car.status == CarStatus.Available, "Car not available");
        car.status = CarStatus.Rented;
        car.renter = renter;
    }

    function setCarAvailable(uint256 carId) external override {
        Car storage car = cars[carId];
        require(car.status == CarStatus.Rented, "Car not rented");
        car.status = CarStatus.Available;
        car.renter = address(0);
    }

    function setCarMaintenance(uint256 carId) external override onlyOwner {
        Car storage car = cars[carId];
        car.status = CarStatus.Maintenance;
    }
}

