// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CarRegistry {
    enum CarStatus { Available, Rented, Maintenance }

    struct Car {
        string plateNumber;
        string model;
        string location;
        uint256 pricePerDay;
        uint8 status;
        address renter;
        address owner; // 🚨 차량 등록자
    }

    mapping(string => Car) public cars;
    string[] public carPlates;

    modifier carExists(string memory plateNumber) {
        require(bytes(cars[plateNumber].plateNumber).length != 0, "Car does not exist");
        _;
    }

    modifier onlyOwner(string memory plateNumber) {
        require(cars[plateNumber].owner == msg.sender, "Only car owner can modify");
        _;
    }

    // 🚗 차량 등록
    function addCar(
        string memory plateNumber,
        string memory model,
        string memory location,
        uint256 pricePerDay
    ) external {
        require(bytes(cars[plateNumber].plateNumber).length == 0, "Car already exists");

        cars[plateNumber] = Car({
            plateNumber: plateNumber,
            model: model,
            location: location,
            pricePerDay: pricePerDay,
            status: 0,
            renter: address(0),
            owner: msg.sender
        });

        carPlates.push(plateNumber);
    }

    // 🛠 차량 수정 (등록자만 가능)
    function updateCar(
        string memory plateNumber,
        string memory model,
        string memory location,
        uint256 pricePerDay
    ) external carExists(plateNumber) onlyOwner(plateNumber) {
        Car storage car = cars[plateNumber];
        if (bytes(model).length > 0) car.model = model;
        if (bytes(location).length > 0) car.location = location;
        if (pricePerDay > 0) car.pricePerDay = pricePerDay;
    }

    // ❌ 차량 삭제 (등록자만 가능)
    function deleteCar(string memory plateNumber) external carExists(plateNumber) onlyOwner(plateNumber) {
        delete cars[plateNumber];
        for (uint i = 0; i < carPlates.length; i++) {
            if (keccak256(bytes(carPlates[i])) == keccak256(bytes(plateNumber))) {
                carPlates[i] = carPlates[carPlates.length - 1];
                carPlates.pop();
                break;
            }
        }
    }

    // 📋 차량 목록 조회
    function getCarPlates() external view returns (string[] memory) {
        return carPlates;
    }

    // 차량 상세 조회
    function getCar(string memory plateNumber) external view carExists(plateNumber) returns (
        string memory, string memory, string memory, uint256, uint8, address, address
    ) {
        Car memory car = cars[plateNumber];
        return (
            car.plateNumber,
            car.model,
            car.location,
            car.pricePerDay,
            car.status,
            car.renter,
            car.owner
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








