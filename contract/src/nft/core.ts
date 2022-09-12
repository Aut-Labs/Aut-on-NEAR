// @ts-nocheck
import { Contract } from ".";
export class JsonToken {
    token_id: string;
    owner_id: string;
    metadata: string;

    constructor({ 
        tokenId, 
        ownerId, 
        metadata, 
    }:{
        tokenId: string,
        ownerId: string,
        metadata: string,
    }) {
        //token ID
        this.token_id = tokenId,
        //owner of the token
        this.owner_id = ownerId,
        //token metadata
        this.metadata = metadata
    }
}
//get the information for a specific token ID
export function internalNftToken({
    contract,
    tokenId
}:{ 
    contract: Contract, 
    tokenId: string 
}) {
    let token = contract.tokensById.get(tokenId) as Token;
    //if there wasn't a token ID in the tokens_by_id collection, we return None
    if (token == null) {
        return null;
    }

    //if there is some token ID in the tokens_by_id collection
    //we'll get the metadata for that token
    let metadata = contract.tokenMetadataById.get(tokenId);
    
    //we return the JsonToken
    let jsonToken = new JsonToken({
        tokenId: tokenId,
        ownerId: token.owner_id,
        metadata,
    });
    return jsonToken;
}
