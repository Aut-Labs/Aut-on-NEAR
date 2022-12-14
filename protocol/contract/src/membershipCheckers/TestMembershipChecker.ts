//SPDX-License-Identifier: MIT
import { NearBindgen, view, assert, initialize, call, NearPromise, near, bytes } from 'near-sdk-js';
import { IMembershipChecker } from "./IMembershipChecker";
const NO_DEPOSIT = BigInt(0);

/// @title NewMembershipChecker
/// @notice Implementation of IMembershipChecker for your new DAO standard
@NearBindgen({})
class TestMembershipChecker implements IMembershipChecker {

    @initialize({})
    init({ }: {}) {
    }
    /// @notice Implements a check if an address is a member of a DAO
    /// @param daoToken the address of the DAO contract - In this case daoAddress is dao token
    /// @param member the address of the member for which the check is made
    /// @return true if the user address is a member, false otherwise
    @view({})
    isMember({ daoAddress, member }): boolean {
        assert(daoAddress.length > 0, "AutID: daoAddress empty");
        assert(member.length > 0, "AutID: member empty");

        // implement your membership checker logic here
        // return reasonable result ;)

        return true;
    }

}
