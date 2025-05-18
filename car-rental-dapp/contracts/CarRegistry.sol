// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/ICarRegistry.sol";

contract CarRegistry is ICarRegistry {
    address public admin;

    struct Car {
        string plateNumber;
        string model;
        string location;
        uint256 pricePerDay;
        uint8 status; // 0: 사용 가능, 1: 대여 중, 2: 점검 중
        address renter;
    }

    mapping(string => Car) public cars;
    string[] public carPlates;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier carExists(string memory plateNumber) {
        require(bytes(cars[plateNumber].plateNumber).length != 0, "Car does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // 🚗 차량 추가
    function addCar(
        string memory plateNumber,
        string memory model,
        string memory location,
        uint256 pricePerDay
    ) external onlyAdmin {
        require(bytes(cars[plateNumber].plateNumber).length == 0, "Car already exists");

        cars[plateNumber] = Car(plateNumber, model, location, pricePerDay, 0, address(0));
        carPlates.push(plateNumber);
    }

    // 🛠️ 차량 수정
    function updateCar(
        string memory plateNumber,
        string memory model,
        string memory location,
        uint256 pricePerDay
    ) external onlyAdmin carExists(plateNumber) {
        Car storage car = cars[plateNumber];
        if (bytes(model).length > 0) car.model = model;
        if (bytes(location).length > 0) car.location = location;
        if (pricePerDay > 0) car.pricePerDay = pricePerDay;
    }

    // 🗑️ 차량 삭제
    function deleteCar(string memory plateNumber) external onlyAdmin carExists(plateNumber) {
        delete cars[plateNumber];
        for (uint i = 0; i < carPlates.length; i++) {
            if (keccak256(bytes(carPlates[i])) == keccak256(bytes(plateNumber))) {
                carPlates[i] = carPlates[carPlates.length - 1];
                carPlates.pop();
                break;
            }
        }
    }

    // 🚘 모든 차량 목록
    function getCarPlates() external view returns (string[] memory) {
        return carPlates;
    }

    function getCar(string memory plateNumber) external view override returns (
        string memory, string memory, string memory, uint256, uint8, address
    ) {
        Car storage car = cars[plateNumber];
        return (
            car.plateNumber,
            car.model,
            car.location,
            car.pricePerDay,
            car.status,
            car.renter
        );
    }

    function setCarRented(string memory plateNumber, address renter) external carExists(plateNumber) {
        cars[plateNumber].status = 1;
        cars[plateNumber].renter = renter;
    }

    function setCarAvailable(string memory plateNumber) external carExists(plateNumber) {
        cars[plateNumber].status = 0;
        cars[plateNumber].renter = address(0);
    }
}






