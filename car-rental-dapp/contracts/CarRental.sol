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

    /// @notice Mapping of carId to deposited amount (for refund)
    mapping(uint256 => uint256) public deposits;

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
     * @param carId ID of the car to rent
     */
    function rentCar(uint256 carId) external payable {
        require(kycManager.checkKYC(msg.sender), "KYC not approved");

        (
            , // id
            , // model
            , // location
            uint256 pricePerDay,
            uint8 status,
            
        ) = carRegistry.getCar(carId);

        require(status == uint8(ICarRegistry.CarStatus.Available), "Car is not available");
        require(msg.value >= pricePerDay, "Insufficient payment");

        deposits[carId] = msg.value;

        carRegistry.setCarRented(carId, msg.sender);
        vault.deposit{value: msg.value}();
    }

    /**
     * @notice Complete a rental and refund deposit to renter
     * @param carId ID of the car being returned
     */
    function completeRental(uint256 carId) external {
        (
            , // id
            , // model
            , // location
            , // pricePerDay
            uint8 status,
            address renter
        ) = carRegistry.getCar(carId);

        require(status == uint8(ICarRegistry.CarStatus.Rented), "Car is not currently rented");

        carRegistry.setCarAvailable(carId);

        uint256 deposit = deposits[carId];
        deposits[carId] = 0;
        vault.refund(renter, deposit);
    }

    /**
     * @notice View deposit amount for a given car
     * @param carId ID of the car
     * @return Amount in wei
     */
    function getDeposit(uint256 carId) external view returns (uint256) {
        return deposits[carId];
    }
}

