import { NearBindgen, call, view, LookupMap, UnorderedMap, assert, initialize, near, NearPromise, bytes, Vector } from 'near-sdk-js'
import { internalAddTokenToOwner } from './nft/internal';

/// This spec can be treated like a version of the standard.
export const NFT_METADATA_SPEC = "nft-1.0.0";

/// This is the name of the NFT standard we're using
export const NFT_STANDARD_NAME = "nep171";

const FIVE_TGAS = BigInt("50000000000000");
const NO_DEPOSIT = BigInt(0);
const NO_ARGS = bytes(JSON.stringify({}));
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
    tokensPerOwner: LookupMap = new LookupMap('tokensPerOwner');
    tokens: UnorderedMap = new UnorderedMap('tokens');

    // AutID props 
    holderToDAOMembershipData: UnorderedMap = new UnorderedMap('holderToDAOMembershipData');
    holderToDAOs: UnorderedMap = new UnorderedMap('holderToDAOs');
    autIDByOwner: UnorderedMap = new UnorderedMap('autIDByOwner');
    autIDUsername: UnorderedMap = new UnorderedMap('autIDUsername');
    autIDToDiscordID: UnorderedMap = new UnorderedMap('autIDToDiscordID');
    discordIDToAddress: UnorderedMap = new UnorderedMap('discordIDToAddress');


    /*
        initialization function (can only be called once).
        this initializes the contract with metadata that was passed in and
        the owner_id. 
    */
    @initialize({})
    init({
        metadata = {
            spec: "nft-1.0.0",
            name: "AutID",
            symbol: "AUT"
        }
    }) {
    }



    @call({})
    addDiscordIDToAutID(discordID: string) {
        let autID: number = this.autIDByOwner[near.predecessorAccountId()];

        this.autIDToDiscordID[autID] = discordID;
        this.discordIDToAddress[discordID] = near.predecessorAccountId();

        // TODO: emit event 
        // emit DiscordIDConnectedToAutID();
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
            this.tokensPerOwner[near.predecessorAccountId()] == undefined,
            "AutID: There is AutID already registered for this address."
        );
        assert(
            this.autIDUsername[username] == undefined,
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

        assert(this.tokens[this.tokenId.toString()] == undefined, 'Token already exists');
        this.tokens[this.tokenId.toString()] = { owner_id: accountID, token_id: this.tokenId.toString(), metadata: url } as NFT;

        internalAddTokenToOwner(this, accountID, this.tokenId.toString());

        this.holderToDAOMembershipData[accountID] = new UnorderedMap('asdasd');
        this.holderToDAOMembershipData[accountID][daoExpander] = {
            daoExpanderAddress: daoExpander,
            role,
            commitment,
            isActive: true
        };


        this.holderToDAOs[accountID] = new Vector('asd132');
        this.holderToDAOs[accountID].push(daoExpander);
        this.autIDByOwner[accountID] = this.tokenId.toString();
        this.autIDUsername[lowerCase] = accountID;

        this.tokenId++;

        return this.tokenId - 1;
        // const promise = NearPromise.new(daoExpander)
        //     .functionCall("join", bytes(JSON.stringify({ newMember: near.predecessorAccountId() })), NO_DEPOSIT, FIVE_TGAS);

        // return promise.asReturn();
    }

    @call({})
    joinDAO({
        role,
        commitment,
        daoExpander
    }: { role: number, commitment: number, daoExpander: string }
    ) {
        assert(role > 0 && role < 4, "Role must be between 1 and 3");
        assert(
            commitment > 0 && commitment < 11,
            "AutID: Commitment should be between 1 and 10"
        );
        assert(daoExpander.length > 0, "AutID: Missing DAO Expander");
        assert(
            this.tokensPerOwner[near.predecessorAccountId()] == 1,
            "AutID: There is no AutID registered for this address."
        );

        let currentComs = this.holderToDAOs[near.predecessorAccountId()];
        for (let index = 0; index < currentComs.length; index++) {
            assert(
                currentComs[index] != daoExpander,
                "AutID: Already a member"
            );
        }

        // TODO: implement
        // require(
        //     commitment >= IDAOExpander(daoExpander).getDAOData().commitment,
        //     "Commitment lower than the DAOs min commitment"
        // );

        let userDAOs = this.holderToDAOs[near.predecessorAccountId()];
        let totalCommitment = 0;
        for (let index = 0; index < userDAOs.length; index++) {
            totalCommitment += this.holderToDAOMembershipData[near.predecessorAccountId()][
                userDAOs[index]
            ].commitment;
        }
        assert(
            totalCommitment + commitment < 11,
            "Maximum commitment reached"
        );

        // TODO: implement
        // assert(
        //     IDAOExpander(daoExpander).isMemberOfOriginalDAO(near.predecessorAccountId()),
        //     "AutID: Not a member of this DAO!"
        // );

        this.holderToDAOMembershipData[near.predecessorAccountId()][daoExpander] = {
            daoExpanderAddress: daoExpander,
            role,
            commitment,
            isActive: true
        } as DAOMember;
        this.holderToDAOs[near.predecessorAccountId()].push(daoExpander);

        NearPromise.new(daoExpander)
            .functionCall("join", bytes(JSON.stringify({ newMember: near.predecessorAccountId() })), NO_DEPOSIT, FIVE_TGAS);

        // TODO: emit event
        // emit DAOJoined(daoExpander, near.predecessorAccountId());
    }

    @call({})
    withdraw({ daoExpander }: { daoExpander: string }) {
        assert(
            this.holderToDAOMembershipData[near.predecessorAccountId()][daoExpander].isActive,
            "AutID: Not a member"
        );
        this.holderToDAOMembershipData[near.predecessorAccountId()][daoExpander].isActive = false;
        this.holderToDAOMembershipData[near.predecessorAccountId()][daoExpander].commitment = 0;

        //TODO: emit event
        // emit DAOWithdrown(daoExpander, msg.sender);
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


        // TODO: find a better way
        // assert(
        //     newCommitment >= IDAOExpander(daoExpander).getDAOData().commitment,
        //     "Commitment lower than the DAOs min commitment"
        // );

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

        // TODO: emit event
        // emit CommitmentUpdated(daoExpander, near.predecessorAccountId(), newCommitment);
    }

    @call({})
    setMetadataUri({ metadataUri }: { metadataUri: string }) {
        assert(this.tokensPerOwner[near.predecessorAccountId()] == 1, "AutID: Doesn't have an AutID.");
        let tokenId = this.autIDByOwner[near.predecessorAccountId()];
        this.tokens[tokenId].metadata = metadataUri;
        // TODO: emit event
        // emit MetadataUriSet(tokenId, metadataUri);
    }

    /// @notice gets all communities the AutID holder is a member of
    /// @param autIDHolder the address of the AutID holder
    /// @return daos dao expander addresses that the aut holder is a part of
    @view({})
    getHolderDAOs({ autIDHolder }: { autIDHolder: string }): Vector {
        assert(this.tokensPerOwner[autIDHolder] == 1, "AutID: Doesn't have an AutID.");
        return this.holderToDAOs[autIDHolder];
    }


    @view({})
    getMembershipData({ autIDHolder, daoExpander }: { autIDHolder: string, daoExpander: string }): DAOMember {
        return this.holderToDAOMembershipData[autIDHolder][daoExpander];
    }

    @view({})
    getAutIDByOwner({ autIDOwner }: { autIDOwner: string }) {
        assert(
            this.tokensPerOwner[autIDOwner] == 1,
            "AutID: The AutID owner is invalid."
        );
        return this.autIDByOwner[autIDOwner];
    }

    @view({})
    getTotalCommitment({ autIDHolder }: { autIDHolder: string }): number {
        assert(
            this.tokensPerOwner[autIDHolder] == 1,
            "AutID: The AutID owner is invalid."
        );
        let userDAOs = this.holderToDAOs[autIDHolder];

        let totalCommitment = 0;
        for (let index = 0; index < userDAOs.length; index++) {
            totalCommitment += this.holderToDAOMembershipData[autIDHolder][
                userDAOs[index]
            ].commitment;
        }
        return totalCommitment;
    }

    @view({})
    getAutIDHolderByUsername({ username }: { username: string }): string {
        return this.autIDUsername[username.toLowerCase()];
    }


    /*
        CORE NFT functions
    */
    @view({})
    //get the information for a specific token ID
    nft_token({ token_id }: { token_id: string }): NFT {
        near.log(token_id);
        near.log(this.tokens[token_id]);

        return this.tokens[token_id];
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
