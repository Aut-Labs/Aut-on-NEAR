
/// @title IDAOTypes
/// @notice IDAOTypes has a mapping between type and MembershipChecker deployed for all DAO standards that are supported by AutID
/// @dev The contract is Ownable to ensure that only the AutID team can add new types.
interface IDAOTypes {
    // event DAOTypeAdded(uint256 daoType, address membershipCheckerAddress);

    /// @notice Returns the address of the MembershipChecker implementation for a given type
    /// @param membershipType the type of the Membership Checker DAO
    /// @return the address of the contract that implements IMembershipChecker
    getMembershipCheckerAddress({ daoType }: { daoType: number }): String;

    /// @notice Adds a new type and contract address in the types
    /// @dev Can be called only by the AutID contracts deployer
    /// @param membershipChecker the new contract address that is supported now
    addNewMembershipChecker({ membershipChecker }: { membershipChecker: string }): void;

    typesCount(): number;
}
