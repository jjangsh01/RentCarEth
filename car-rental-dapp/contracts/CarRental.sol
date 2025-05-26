// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/ICarRegistry.sol";

interface IKYCManager {
    function checkKYC(address user) external view returns (bool);
}

interface IRentalVault {
    function deposit() external payable;
    function refund(address to, uint256 amount) external;
}

contract CarRental {
    ICarRegistry public immutable carRegistry;
    IKYCManager public immutable kycManager;
    IRentalVault public immutable vault;

    mapping(bytes32 => uint256) public deposits;

    // 새롭게 추가된 구조체
    struct RentalInfo {
        address renter;
        uint256 amountPaid;
        uint256 timestamp;
        bool returned;
    }

    // 차량 번호판 → 렌탈정보 매핑
    mapping(string => RentalInfo) public rentalRecords;

    constructor(
        address _carRegistry,
        address _kycManager,
        address _vault
    ) {
        carRegistry = ICarRegistry(_carRegistry);
        kycManager = IKYCManager(_kycManager);
        vault = IRentalVault(_vault);
    }

    function rentCar(string memory plateNumber) external payable {
        require(kycManager.checkKYC(msg.sender), "KYC not approved");

        bytes32 carId = keccak256(abi.encodePacked(plateNumber));

        (
            string memory carPlate,
            , // model
            , // location
            uint256 pricePerDay,
            uint8 status,
            address renter,
            address owner
        ) = carRegistry.getCar(plateNumber);

        require(bytes(carPlate).length != 0, "Car not found");
        require(status == uint8(ICarRegistry.CarStatus.Available), "Car is not available");
        require(msg.value >= pricePerDay, "Insufficient payment");

        deposits[carId] = msg.value;

        // 렌탈 정보 기록
        rentalRecords[plateNumber] = RentalInfo({
            renter: msg.sender,
            amountPaid: msg.value,
            timestamp: block.timestamp,
            returned: false
        });

        carRegistry.setCarRented(plateNumber, msg.sender);
        vault.deposit{value: msg.value}();

        emit CarRented(plateNumber, msg.sender);
    }

    function completeRental(string memory plateNumber) external {
        bytes32 carId = keccak256(abi.encodePacked(plateNumber));

        (
            string memory carPlate,
            , , , // model, location, pricePerDay
            uint8 status,
            address renter,
            address owner
        ) = carRegistry.getCar(plateNumber);

        require(bytes(carPlate).length != 0, "Car not found");
        require(status == uint8(ICarRegistry.CarStatus.Rented), "Car is not currently rented");
        require(renter == msg.sender, "You are not the renter");

        carRegistry.setCarAvailable(plateNumber);

        uint256 deposit = deposits[carId];
        deposits[carId] = 0;
        vault.refund(renter, deposit);

        // 상태 업데이트
        rentalRecords[plateNumber].returned = true;

        emit CarReturned(plateNumber, renter);
    }

    function getDeposit(string memory plateNumber) external view returns (uint256) {
        bytes32 carId = keccak256(abi.encodePacked(plateNumber));
        return deposits[carId];
    }

    // 조회 함수
    function getRentalInfo(string memory plateNumber)
        external
        view
        returns (address renter, uint256 amountPaid, uint256 timestamp, bool returned)
    {
        RentalInfo memory info = rentalRecords[plateNumber];
        return (info.renter, info.amountPaid, info.timestamp, info.returned);
    }

    event CarRented(string plateNumber, address renter);
    event CarReturned(string plateNumber, address renter);
}






