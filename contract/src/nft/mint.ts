// @ts-nocheck
import { assert } from "near-sdk-js";
import { Contract } from "../autID";
import { internalAddTokenToOwner } from "./internal";

export function internalMint({
    contract,
    tokenId,
    metadata,
    receiverId
}:{ 
    contract: Contract, 
    tokenId: string, 
    metadata: string, 
    receiverId: string 
}): void {

    //insert the token ID and metadata
    contract.tokenMetadataById.set(tokenId, metadata);

    //call the internal method for adding the token to the owner
    internalAddTokenToOwner(contract, token.owner_id, tokenId)

}