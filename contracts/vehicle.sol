// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @title VehicleRegistry
/// @author
/// @notice 차량 등록/수정/삭제 및 외부 계약에 의한 사용 가능 상태 변경을 관리
/// @dev 외부 RentalManager 등의 계약은 화이트리스트에 등록된 경우에만 상태 변경 가능




contract VehicleRegistry {
    /// @dev 차량 정보를 저장하는 구조체
    struct Vehicle {
        string plateNumber;  // 차량 번호판
        string vehicleType;  // 예: SUV, 세단 등
        string location;     // 현재 차량 위치
        string status;       // 예: 정비 중, 운행 가능 등
        bool isAvailable;    // 예약 가능 여부
        bool exists;         // 존재 여부 (중복 등록 방지)
        address _user;       // 계약한 사용자 주소 
    }

    /// ---------------------
    ///  이벤트 정의
    /// ---------------------

    /// @notice 새로운 차량이 등록될 때 발생
    event VehicleRegistered(string indexed plateNumber);

    /// @notice 차량 정보가 수정될 때 발생
    event VehicleUpdated(string indexed plateNumber);

    /// @notice 차량이 삭제될 때 발생
    event VehicleRemoved(string indexed plateNumber);

    /// @notice 차량의 예약 가능 상태가 변경될 때 발생
    event AvailabilityUpdated(string indexed plateNumber, bool isAvailable);

    /// @notice 새로운 외부 계약이 업데이터로 등록될 때 발생
    event AuthorizedUpdaterAdded(address indexed updater);

    /// @notice 외부 계약이 업데이터 목록에서 제거될 때 발생
    event AuthorizedUpdaterRemoved(address indexed updater);

    /// @notice 차량이 대여될 때 발생
    event VehicleRented(string indexed plateNumber, address indexed user);

    /// @notice 차량이 반납될 때 발생
    event VehicleReturned(string indexed plateNumber);

    /// ---------------------
    ///  상태 변수
    /// ---------------------

    /// @dev plateNumber 기반 차량 정보 저장
    mapping(string => Vehicle) private vehicles;

    /// @dev 전체 plateNumber 목록 저장
    string[] private plateNumbers;

    /// @dev 계약 소유자 (관리자)
    address public owner;

    /// @dev 차량 상태 변경이 허용된 외부 계약 목록 (화이트리스트)
    mapping(address => bool) public authorizedUpdaters;

    

    /// ---------------------
    ///  접근 제어자
    /// ---------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyAuthorizedUpdater() {
        require(authorizedUpdaters[msg.sender], "Not authorized updater");
        _;
    }

    /// ---------------------
    ///  생성자
    /// ---------------------

    /**
     * @notice 계약 배포자(owner)를 설정
     */
    constructor() {
        owner = msg.sender;
    }

    /// ---------------------
    ///  관리자 함수
    /// ---------------------

    // 회원가입 과정에서 사용 
    /**
     * @notice 차량 상태 변경을 허용할 외부 계약을 등록
     * @param updater 외부 계약 주소
     */
    function addAuthorizedUpdater(address updater) external onlyOwner {
        require(updater != address(0), "Zero address");
        authorizedUpdaters[updater] = true;
        emit AuthorizedUpdaterAdded(updater);
    }

    // 회원 삭제 과정에서 사용 
    /**
     * @notice 외부 계약을 화이트리스트에서 제거
     * @param updater 외부 계약 주소
     */
    function removeAuthorizedUpdater(address updater) external onlyOwner {
        require(authorizedUpdaters[updater], "Updater not listed");
        authorizedUpdaters[updater] = false;
        emit AuthorizedUpdaterRemoved(updater);
    }

    /// ---------------------
    ///  차량 관리 함수
    /// ---------------------

    /**
     * @notice 차량 등록
     * @dev plateNumber는 중복 불가
     * @param plateNumber 차량 번호
     * @param vehicleType 차량 종류
     * @param location 차량 위치
     * @param status 차량 상태 설명
     */
    function registerVehicle(
        string memory plateNumber,
        string memory vehicleType,
        string memory location,
        string memory status
    ) external onlyOwner {
        require(!vehicles[plateNumber].exists, "Vehicle already exists");

        vehicles[plateNumber] = Vehicle({
            plateNumber: plateNumber,
            vehicleType: vehicleType,
            location: location,
            status: status,
            isAvailable: true,
            exists: true,
            _user: address(0)
        });

        plateNumbers.push(plateNumber);
        emit VehicleRegistered(plateNumber);
    }

    /**
     * @notice 차량 정보 수정
     * @param plateNumber 차량 번호
     * @param vehicleType 새 차량 종류
     * @param location 새 위치
     * @param status 새 상태
     */
    function updateVehicle(
        string memory plateNumber,
        string memory vehicleType,
        string memory location,
        string memory status
    ) external onlyOwner {
        require(vehicles[plateNumber].exists, "Vehicle not found");

        Vehicle storage v = vehicles[plateNumber];
        v.vehicleType = vehicleType;
        v.location = location;
        v.status = status;

        emit VehicleUpdated(plateNumber);
    }

    /**
     * @notice 차량 삭제
     * @param plateNumber 삭제할 차량 번호
     */
    function removeVehicle(string memory plateNumber) external onlyOwner {
        require(vehicles[plateNumber].exists, "Vehicle not found");

        delete vehicles[plateNumber];

        // plateNumbers 배열에서 제거
        for (uint256 i = 0; i < plateNumbers.length; i++) {
            if (keccak256(bytes(plateNumbers[i])) == keccak256(bytes(plateNumber))) {
                plateNumbers[i] = plateNumbers[plateNumbers.length - 1];
                plateNumbers.pop();
                break;
            }
        }

        emit VehicleRemoved(plateNumber);
    }



    /// ---------------------
    ///  차량 대여 및 반납 함수
    /// ---------------------

    /**
     * @notice 차량을 대여할 때 호출되는 함수
     * @dev 차량이 예약 가능 상태여야 대여 가능
     * @param plateNumber 대여할 차량 번호
     * @param user 대여를 요청한 사용자 주소
     */
    function rentVehicle(string memory plateNumber, address user) external onlyAuthorizedUpdater {
        require(vehicles[plateNumber].exists, "Vehicle not found");
        require(vehicles[plateNumber].isAvailable, "Vehicle not available");

        // 차량 예약 상태 및 대여자 정보 업데이트
        vehicles[plateNumber].isAvailable = false;
        vehicles[plateNumber]._user = user;

        emit VehicleRented(plateNumber, user);
    }

    /**
     * @notice 차량을 반납할 때 호출되는 함수
     * @dev 차량이 이미 사용 가능 상태라면 반납할 수 없음
     * @param plateNumber 반납할 차량 번호
     */
    function returnVehicle(string memory plateNumber) external onlyAuthorizedUpdater {
        require(vehicles[plateNumber].exists, "Vehicle not found");
        require(!vehicles[plateNumber].isAvailable, "Vehicle already available");

        // 차량 상태 및 대여자 정보 초기화
        vehicles[plateNumber].isAvailable = true;
        vehicles[plateNumber]._user = address(0);

        emit VehicleReturned(plateNumber);
    }

    /// ---------------------
    ///  View 함수
    /// ---------------------

    /**
     * @notice 특정 차량 정보를 조회
     * @param plateNumber 조회할 차량 번호
     * @return vehicleType 차량 종류
     * @return location 차량 위치
     * @return status 차량 상태
     * @return isAvailable 예약 가능 여부
     * @return _user 현재 대여자 주소
     */
    function getVehicle(string memory plateNumber)
        external
        view
        returns (string memory vehicleType, string memory location, string memory status, bool isAvailable, address _user)
    {
        require(vehicles[plateNumber].exists, "Vehicle not found");
        Vehicle storage v = vehicles[plateNumber];
        return (v.vehicleType, v.location, v.status, v.isAvailable, v._user);
    }

    /**
     * @notice 전체 차량 번호 목록 조회
     * @return plate 번호 배열
     */
    function getAllPlateNumbers() external view returns (string[] memory) {
        return plateNumbers;
    }

    /**
     * @notice 차량 등록 여부 확인
     * @param plateNumber 확인할 차량 번호
     * @return true면 등록됨, false면 아님
     */
    function isRegistered(string memory plateNumber) external view returns (bool) {
        return vehicles[plateNumber].exists;
    }

    /**
     * @notice 모든 차량 정보를 조회
     * @dev 차량의 세부 정보를 배열 형태로 반환
     * @return Vehicle[] 구조체 배열로 전체 차량 정보 반환
     */
    function getAllVehicles() external view returns (Vehicle[] memory) {
        uint256 length = plateNumbers.length;
        Vehicle[] memory allVehicles = new Vehicle[](length);
        for (uint256 i = 0; i < length; i++) {
            allVehicles[i] = vehicles[plateNumbers[i]];
        }
        return allVehicles;
    }
}
