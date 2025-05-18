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

/**
 * @title CarRental
 * @notice Handles rental logic: user verification, car booking, payment, and refund.
 */
contract CarRental {
    ICarRegistry public immutable carRegistry;
    IKYCManager public immutable kycManager;
    IRentalVault public immutable vault;

    /// @notice Mapping of car ID (hash) to deposited amount (for refund)
    mapping(bytes32 => uint256) public deposits;

    constructor(
        address _carRegistry,
        address _kycManager,
        address _vault
    ) {
        carRegistry = ICarRegistry(_carRegistry);
        kycManager = IKYCManager(_kycManager);
        vault = IRentalVault(_vault);
    }

    /**
     * @notice Rent a car if KYC verified and car is available
     * @param plateNumber Plate number of the car to rent
     */
    function rentCar(string memory plateNumber) external payable {
        require(kycManager.checkKYC(msg.sender), "KYC not approved");

        // 🔑 해시로 ID 변환하여 사용
        bytes32 carId = keccak256(abi.encodePacked(plateNumber));

        // ✅ 차량 조회
        (
            string memory carPlate,
            , // model
            , // location
            uint256 pricePerDay,
            uint8 status,
            address renter
        ) = carRegistry.getCar(plateNumber);

        require(bytes(carPlate).length != 0, "Car not found");
        require(status == uint8(ICarRegistry.CarStatus.Available), "Car is not available");
        require(msg.value >= pricePerDay, "Insufficient payment");

        deposits[carId] = msg.value;

        carRegistry.setCarRented(plateNumber, msg.sender);
        vault.deposit{value: msg.value}();

        emit CarRented(plateNumber, msg.sender);
    }

    /**
     * @notice Complete a rental and refund deposit to renter
     * @param plateNumber Plate number of the car being returned
     */
    function completeRental(string memory plateNumber) external {
        bytes32 carId = keccak256(abi.encodePacked(plateNumber));

        (
            string memory carPlate,
            , // model
            , // location
            , // pricePerDay
            uint8 status,
            address renter
        ) = carRegistry.getCar(plateNumber);

        require(bytes(carPlate).length != 0, "Car not found");
        require(status == uint8(ICarRegistry.CarStatus.Rented), "Car is not currently rented");
        require(renter == msg.sender, "You are not the renter");

        carRegistry.setCarAvailable(plateNumber);

        uint256 deposit = deposits[carId];
        deposits[carId] = 0;
        vault.refund(renter, deposit);

        emit CarReturned(plateNumber, renter);
    }

    /**
     * @notice View deposit amount for a given car
     * @param plateNumber Plate number of the car
     * @return Amount in wei
     */
    function getDeposit(string memory plateNumber) external view returns (uint256) {
        bytes32 carId = keccak256(abi.encodePacked(plateNumber));
        return deposits[carId];
    }

    /// @notice Event emitted when a car is rented
    event CarRented(string plateNumber, address renter);

    /// @notice Event emitted when a car is returned
    event CarReturned(string plateNumber, address renter);
}




