//SPDX-License-Identifier: MIT
import { NearBindgen, view, assert, initialize, call, NearPromise, near, bytes } from 'near-sdk-js';
import { IMembershipChecker } from "./IMembershipChecker";
const NO_DEPOSIT = BigInt(0);

/// @title NewMembershipChecker
/// @notice Implementation of IMembershipChecker for your new DAO standard
@NearBindgen({})
class SputnikDAOMembershipChecker implements IMembershipChecker {

    @initialize({})
    init({ }: {}) {
    }
    /// @notice Implements a check if an address is a member of a DAO
    /// @param daoToken the address of the DAO contract - In this case daoAddress is dao token
    /// @param member the address of the member for which the check is made
    /// @return true if the user address is a member, false otherwise
    @call({})
    isMember({ daoAddress, member }): NearPromise {
        assert(daoAddress.length > 0, "AutID: daoAddress empty");
        assert(member.length > 0, "AutID: member empty");

        // near view <ft-contract> ft_balance_of '{"account_id": "<users-account>"}'
        const promise = NearPromise.new(daoAddress)
            .functionCall("ft_balance_of", bytes(JSON.stringify({ account_id: member })), NO_DEPOSIT, NO_DEPOSIT)
            .then(
                NearPromise.new(near.currentAccountId())
                    .functionCall("isMember_callback", bytes(JSON.stringify({})), NO_DEPOSIT, NO_DEPOSIT)
            );
        return promise.asReturn();
    }

    @call({ privateFunction: true })
    isMember_callback(): boolean {
        return near.promiseResult(0) == 'true';
    }
}
