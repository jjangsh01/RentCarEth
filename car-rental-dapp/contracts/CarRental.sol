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

    uint256 public constant DEPOSIT_MULTIPLIER = 2;

    mapping(bytes32 => uint256) public deposits;

    struct RentalInfo {
        address renter;
        uint256 amountPaid;
        uint256 rentalFee;
        uint256 depositAmount;
        uint256 timestamp;
        bool returned;
    }

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

        uint256 rentalFee = pricePerDay;
        uint256 depositAmount = rentalFee * DEPOSIT_MULTIPLIER;
        uint256 totalRequired = rentalFee + depositAmount;

        require(msg.value >= totalRequired, "Insufficient payment");

        // 대여료 즉시 차량 소유자에게 송금
        (bool sent, ) = payable(owner).call{value: rentalFee}("");
        require(sent, "Transfer to owner failed");

        // 보증금은 vault로 전송
        vault.deposit{value: depositAmount}();

        // 보증금 기록 (환불용)
        deposits[carId] = depositAmount;

        rentalRecords[plateNumber] = RentalInfo({
            renter: msg.sender,
            amountPaid: msg.value,
            rentalFee: rentalFee,
            depositAmount: depositAmount,
            timestamp: block.timestamp,
            returned: false
        });

        carRegistry.setCarRented(plateNumber, msg.sender);

        emit CarRented(plateNumber, msg.sender, rentalFee, depositAmount);
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

        uint256 depositToRefund = deposits[carId];
        deposits[carId] = 0;

        if (depositToRefund > 0) {
            vault.refund(renter, depositToRefund);
        }

        rentalRecords[plateNumber].returned = true;

        emit CarReturned(plateNumber, renter, depositToRefund);
    }

    function getDeposit(string memory plateNumber) external view returns (uint256) {
        bytes32 carId = keccak256(abi.encodePacked(plateNumber));
        return deposits[carId];
    }

    function getRentalInfo(string memory plateNumber)
        external
        view
        returns (address renter, uint256 amountPaid, uint256 timestamp, bool returned)
    {
        RentalInfo memory info = rentalRecords[plateNumber];
        return (info.renter, info.amountPaid, info.timestamp, info.returned);
    }

    function getDetailedRentalInfo(string memory plateNumber)
        external
        view
        returns (
            address renter,
            uint256 totalPaid,
            uint256 rentalFee,
            uint256 depositAmount,
            uint256 timestamp,
            bool returned
        )
    {
        RentalInfo memory info = rentalRecords[plateNumber];
        return (
            info.renter,
            info.amountPaid,
            info.rentalFee,
            info.depositAmount,
            info.timestamp,
            info.returned
        );
    }

    function getDepositMultiplier() external pure returns (uint256) {
        return DEPOSIT_MULTIPLIER;
    }

    event CarRented(string plateNumber, address renter, uint256 rentalFee, uint256 deposit);
    event CarReturned(string plateNumber, address renter, uint256 refundedDeposit);
}
