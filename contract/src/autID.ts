import { NearBindgen, call, view, LookupMap, UnorderedMap, assert, initialize, near, NearPromise, bytes, Vector } from 'near-sdk-js'

/// This spec can be treated like a version of the standard.
export const NFT_METADATA_SPEC = "nft-1.0.0";

/// This is the name of the NFT standard we're using
export const NFT_STANDARD_NAME = "nep171";

const FIVE_TGAS = BigInt("50000000000000");
const NO_DEPOSIT = BigInt(0);
interface NFT {
    token_id: string;
    owner_id: string;
    metadata: string;
}
interface DAOMember {
    daoExpanderAddress: string;
    role: number;
    commitment: number;
    isActive: boolean;
}

@NearBindgen({ requireInit: true })
export class Contract {

    // Counter
    tokenId: number = 1;

    // NFT props
    tokens: UnorderedMap = new UnorderedMap('tokens');

    // AutID props 
    holderToDAOMembershipData: UnorderedMap = new UnorderedMap('holderToDAOMembershipData');
    holderToDAOs: UnorderedMap = new UnorderedMap('holderToDAOs');
    autIDByOwner: UnorderedMap = new UnorderedMap('autIDByOwner');
    autIDUsername: UnorderedMap = new UnorderedMap('autIDUsername');
    autIDToDiscordID: UnorderedMap = new UnorderedMap('autIDToDiscordID');
    discordIDToAddress: UnorderedMap = new UnorderedMap('discordIDToAddress');


    @call({})
    addDiscordIDToAutID(discordID: string) {
        let autID: number = this.autIDByOwner.get(near.predecessorAccountId()) as number;
        this.autIDToDiscordID.set(autID.toString(), discordID);
        this.discordIDToAddress.set(discordID, near.predecessorAccountId());
    }

    @call({})
    nft_mint({
        username,
        url,
        role,
        commitment,
        daoExpander
    }: {
        username: string,
        url: string,
        role: number,
        commitment: number,
        daoExpander: string
    }) {
        assert(role > 0 && role < 4, "Role must be between 1 and 3");
        assert(
            commitment > 0 && commitment < 11,
            "AutID: Commitment should be between 1 and 10"
        );
        assert(daoExpander.length > 0, "AutID: Missing DAO Expander");
        assert(
            this.autIDByOwner.get(near.predecessorAccountId()) == undefined,
            "AutID: There is AutID already registered for this address."
        );
        assert(
            this.autIDUsername.get(username) == undefined,
            "AutID: Username already taken!"
        );

        const promise = NearPromise.new(daoExpander)
            .functionCall("is_member_of_original_DAO", bytes(JSON.stringify({ member: near.predecessorAccountId() })), NO_DEPOSIT, FIVE_TGAS)
            .then(
                NearPromise.new(near.currentAccountId())
                    .functionCall("nft_mint_callback", bytes(JSON.stringify({ accountID: near.predecessorAccountId(), username, url, role, commitment, daoExpander })), NO_DEPOSIT, FIVE_TGAS)
            );

        return promise.asReturn();
    }

    @call({ privateFunction: true })
    nft_mint_callback({
        accountID,
        username,
        url,
        role,
        commitment,
        daoExpander
    }: {
        accountID: string,
        username: string,
        url: string,
        role: number,
        commitment: number,
        daoExpander: string
    }): number {
        assert(near.promiseResult(0) == 'true', 'not a member of the dao');
        let lowerCase = username.toLocaleLowerCase();

        assert(this.tokens.get(this.tokenId.toString()) == undefined, 'Token already exists');
        this.tokens.set(this.tokenId.toString(), { owner_id: accountID, token_id: this.tokenId.toString(), metadata: url } as NFT);

        let membershipData: UnorderedMap = this.holderToDAOMembershipData.get(accountID) as UnorderedMap;
        if (membershipData == undefined) {
            membershipData = new UnorderedMap('mmd' + accountID);
        }

        membershipData.set(daoExpander, {
            daoExpanderAddress: daoExpander,
            role,
            commitment,
            isActive: true
        } as DAOMember);


        this.holderToDAOMembershipData.set(accountID, membershipData);

        let holderDAOList: Vector = this.holderToDAOs.get(accountID) as Vector;
        if (!holderDAOList) {
            holderDAOList = new Vector('daos' + accountID);
        }
        holderDAOList.push(daoExpander);
        this.holderToDAOs.set(accountID, holderDAOList);
        this.autIDByOwner.set(accountID, this.tokenId.toString());
        this.autIDUsername.set(lowerCase, accountID);

        this.tokenId++;

        return this.tokenId - 1;
        // const promise = NearPromise.new(daoExpander)
        //     .functionCall("join", bytes(JSON.stringify({ newMember: near.predecessorAccountId() })), NO_DEPOSIT, FIVE_TGAS);

        // return promise.asReturn();
    }

    @call({})
    withdraw({ daoExpander }: { daoExpander: string }) {
        assert(
            this.holderToDAOMembershipData[near.predecessorAccountId()][daoExpander].isActive,
            "AutID: Not a member"
        );
        this.holderToDAOMembershipData[near.predecessorAccountId()][daoExpander].isActive = false;
        this.holderToDAOMembershipData[near.predecessorAccountId()][daoExpander].commitment = 0;
    }


    @call({})
    editCommitment({ daoExpander, newCommitment }: { daoExpander: string, newCommitment: number }) {
        assert(
            this.holderToDAOMembershipData[near.predecessorAccountId()][daoExpander].isActive,
            "AutID: Not a member"
        );

        assert(
            newCommitment > 0 && newCommitment < 11,
            "AutID: Commitment should be between 1 and 10"
        );

        let userDAOs = this.holderToDAOs[near.predecessorAccountId()];
        let totalCommitment = 0;
        for (let index = 0; index < userDAOs.length; index++) {
            totalCommitment += this.holderToDAOMembershipData[near.predecessorAccountId()][
                userDAOs[index]
            ].commitment;
        }
        assert(
            totalCommitment +
            newCommitment -
            this.holderToDAOMembershipData[near.predecessorAccountId()][daoExpander].commitment <
            11,
            "Maximum commitment reached"
        );
        this.holderToDAOMembershipData[near.predecessorAccountId()][daoExpander]
            .commitment = newCommitment;
    }

    @call({})
    setMetadataUri({ metadataUri }: { metadataUri: string }) {
        let tokenId = this.autIDByOwner.get(near.predecessorAccountId()) as number;
        const token: NFT = this.tokens[tokenId];
        token.metadata = metadataUri;
        this.tokens.set(tokenId.toString(), token);
    }

    /// @notice gets all communities the AutID holder is a member of
    /// @param autIDHolder the address of the AutID holder
    /// @return daos dao expander addresses that the aut holder is a part of
    @view({})
    getHolderDAOs({ autIDHolder }: { autIDHolder: string }): Vector {
        assert(this.autIDByOwner.get(autIDHolder) != undefined, "AutID: Doesn't have an AutID.");
        return Vector.deserialize(this.holderToDAOs.get(autIDHolder) as Vector);
    }

    @view({})
    getMembershipData({ autIDHolder, daoExpander }: { autIDHolder: string, daoExpander: string }): DAOMember {
        const memData = UnorderedMap.deserialize(this.holderToDAOMembershipData.get(autIDHolder) as UnorderedMap);
        return memData.get(daoExpander) as DAOMember;
    }

    @view({})
    getAutIDByOwner({ autIDOwner }: { autIDOwner: string }) {
        return this.autIDByOwner.get(autIDOwner);
    }

    @view({})
    getTotalCommitment({ autIDHolder }: { autIDHolder: string }): number {
        assert(
            this.autIDByOwner.get(autIDHolder) != undefined,
            "AutID: The AutID owner is invalid."
        );
        let userDAOs = this.holderToDAOs.get(autIDHolder) as Vector;

        let totalCommitment = 0;
        for (let index = 0; index < userDAOs.length; index++) {
            totalCommitment += ((this.holderToDAOMembershipData.get(autIDHolder) as UnorderedMap).get(
                userDAOs[index]
            ) as DAOMember).commitment;
        }
        return totalCommitment;
    }

    @view({})
    getAutIDHolderByUsername({ username }: { username: string }): string {
        return this.autIDUsername.get(username.toLowerCase()) as string;
    }


    /*
        CORE NFT functions
    */
    @view({})
    //get the information for a specific token ID
    nft_token({ token_id }: { token_id: string }): NFT {
        return this.tokens.get(token_id) as NFT;
    }

    @call({})
    //implementation of the nft_transfer method. This transfers the NFT from the current owner to the receiver. 
    nft_transfer({ receiver_id, token_id, approval_id, memo }) {
        assert(false, 'Transfer not allowed');
    }

    @call({})
    //implementation of the transfer call method. This will transfer the NFT and call a method on the receiver_id contract
    nft_transfer_call({ receiver_id, token_id, approval_id, memo, msg }) {
        assert(false, 'Transfer not allowed');
    }

    @call({})
    //resolves the cross contract call when calling nft_on_transfer in the nft_transfer_call method
    //returns true if the token was successfully transferred to the receiver_id
    nft_resolve_transfer({ authorized_id, owner_id, receiver_id, token_id, approved_account_ids, memo }) {
        assert(false, 'Transfer not allowed');
    }

}
