/// @title IMembershipChecker
/// @notice Each DAO standard supported by SW should have an implementation of this interface for their DAO contract

import { NearPromise } from "near-sdk-js";

/// @dev Implement using the logic of the specific DAO contract 
export interface IMembershipChecker {
    /// @notice Implements a check if an address is a member of a specific DAO standard
    /// @param daoAddress the address of the membership/DAO contract
    /// @param member the address of the member for which the check is made
    /// @return true if the user address is a member, false otherwise
    isMember({ daoAddress, member }: { daoAddress: string, member: string }): boolean | NearPromise;
}
