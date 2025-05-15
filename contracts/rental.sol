contract DepositManager {
    address public owner;

    enum RentalStatus { Active, Refunded }

    struct Rental {
        address renter;
        uint256 depositAmount;
        bool carReturned;
        RentalStatus status;
    }

    mapping(uint256 => Rental) public rentals;
    uint256 public rentalCounter;

    event DepositPaid(uint256 rentalId, address renter, uint256 amount);
    event DepositRefunded(uint256 rentalId, address renter, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    // 보증금 예치
    function payDeposit() external payable returns (uint256) {
       require(msg.value > 0, "The deposit must be greater than 0.");

        rentalCounter++;
        rentals[rentalCounter] = Rental({
            renter: msg.sender,
            depositAmount: msg.value,
            carReturned: false,
            status: RentalStatus.Active
        });

        emit DepositPaid(rentalCounter, msg.sender, msg.value);
        return rentalCounter;
    }

    //차량 반납 후, 보증금 반환
    function confirmReturn(uint256 rentalId) external {
    Rental storage rental = rentals[rentalId];
    require(rental.status == RentalStatus.Active, "Not currently active.");

    rental.carReturned = true;

    payable(rental.renter).transfer(rental.depositAmount);
    rental.depositAmount = 0;  // 반환 후 초기화
    rental.status = RentalStatus.Refunded;

    emit DepositRefunded(rentalId, rental.renter, rental.depositAmount);
}


    // 보증금 확인
    function getDeposit(uint256 rentalId) external view returns (uint256) {
        return rentals[rentalId].depositAmount;
    }
}
