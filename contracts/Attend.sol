pragma solidity ^0.4.17;
pragma experimental ABIEncoderV2;

contract Attend {
    
    event Registered();
    event Unregistered();

    struct Organization
    {
        string name;
        uint max_attendance;
        uint attendance_count;
        mapping(address => bool) Attenders;
    }

    mapping(uint => Organization) private organizations;
    uint public organizationCount;

    constructor () public {
       organizationCount = 0;
    }

    modifier organizationExist(uint orgId) {
        require(bytes(organizations[orgId].name).length != 0,"Organization does not exist."); // Check if organization exists
        _;
    }

    modifier ticketAvailable(uint orgId) {
        require(bytes(organizations[orgId].name).length != 0,"Organization does not exist."); // Check if organization exists
        require(organizations[orgId].attendance_count < organizations[orgId].max_attendance,"No slots left for this organization."); // Check if organization attendance limit reached
        _;
    }

    modifier notAttended(uint orgId) {
        require(organizations[orgId].Attenders[msg.sender] == false,"User already attended this organization.");
        _;
    }

    modifier attended(uint orgId) {
        require(organizations[orgId].Attenders[msg.sender] == true,"User not attended this organization.");
        _;
    }

    function addOrganization(string _name,uint _maxAttendance) public {
        organizationCount++;
        organizations[organizationCount] = Organization(_name,_maxAttendance,0);
    }

    function AttendOrganization(uint orgId) public ticketAvailable(orgId) notAttended(orgId) returns (uint) {
        organizations[orgId].Attenders[msg.sender] = true;
        organizations[orgId].attendance_count++;
    }

    function CancelAttendance(uint orgId) public attended(orgId) returns(uint) {
        organizations[orgId].attendance_count--;
        delete organizations[orgId].Attenders[msg.sender];
    }

    function getOrganization(uint orgId) public view organizationExist(orgId) returns (string,uint,uint)
    {
        Organization storage org = organizations[orgId];
        return (org.name,org.attendance_count,org.max_attendance);
    }

    function getOrganizationCount() public view returns (uint) {
        return organizationCount;
    }
}