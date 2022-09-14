import { NearBindgen, near, call, view, Vector, UnorderedMap, initialize, assert } from 'near-sdk-js';
/// @title DAOTypes
/// @notice DAOTypes has a mapping between type and MembershipChecker deployed for all DAO standards that are supported by AutID
/// @dev The contract is Ownable to ensure that only the AutID team can add new types.
@NearBindgen({requireInit:true})
class DAOTypes {

    typeToMembershipChecker: UnorderedMap = new UnorderedMap('type');
    isMembershipChecker: UnorderedMap = new UnorderedMap('is_m_c');
    owner: string = '';
    types: number = 1;

    @initialize({})
    init() {
        this.owner = near.predecessorAccountId();
    }
    /// @notice Returns the address of the MembershipChecker implementation for a given type
    /// @param daoType the type of the Membership Checker DAO
    /// @return the address of the contract that implements IMembershipChecker
    @view({})
    getMembershipCheckerAddress({ daoType }): string {
        return this.typeToMembershipChecker[daoType];
    }

    /// @notice Adds a new type and contract address in the types
    /// @dev Can be called only by the AutID contracts deployer
    /// @param membershipChecker the new contract address that is supported now
    @call({})
    addNewMembershipChecker({ membershipChecker }): void {
        assert(this.owner == near.predecessorAccountId(), 'only owner');
        assert(
            membershipChecker.length > 0,
            "MembershipChecker contract address must be provided"
        );
        assert(
            !this.isMembershipChecker[membershipChecker],
            "MembershipChecker already added"
        );
        this.typeToMembershipChecker[this.types] = membershipChecker;
        this.isMembershipChecker[membershipChecker] = true;
        this.types++;
        // emit DAOTypeAdded(_types.current(), membershipChecker);
    }

    typesCount(): number {
        return this.types;
    }
}
