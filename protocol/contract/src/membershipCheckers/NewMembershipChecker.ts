//SPDX-License-Identifier: MIT
import { NearBindgen, near, call, view, Vector, UnorderedMap, initialize, assert } from 'near-sdk-js';
import { IMembershipChecker } from "./IMembershipChecker";

/// @title NewMembershipChecker
/// @notice Implementation of IMembershipChecker for your new DAO standard
@NearBindgen({})
class NewMembershipChecker implements IMembershipChecker {

    /// @notice Implements a check if an address is a member of a DAO
    /// @param daoAddress the address of the DAO contract
    /// @param member the address of the member for which the check is made
    /// @return true if the user address is a member, false otherwise
    @view({})
    isMember({ daoAddress, member }): boolean {
        assert(daoAddress.length > 0, "AutID: daoAddress empty");
        assert(member.length > 0, "AutID: member empty");

        // implement your membership checker logic here
        // return reasonable result ;)
        return false;
    }
}
