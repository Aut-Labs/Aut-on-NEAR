//SPDX-License-Identifier: MIT
import { NearBindgen, near, call, view, Vector, UnorderedMap, initialize, assert } from 'near-sdk-js';
interface InteractionModel {
    member: string;
    taskID: number;
    contractAddress: string;
}
@NearBindgen({requireInit: true})
class Interaction {
    // event InteractionIndexIncreased(address member, uint256 total);

    idCounter: number = 0;
    daoExpander: string = '';

    interactions: UnorderedMap = new UnorderedMap('its');
    interactionsIndex: UnorderedMap = new UnorderedMap('ii');


    @initialize({})
    init() {
        this.daoExpander = near.predecessorAccountId();
        this.idCounter = 0;
    }

    @call({})
    addInteraction({ activityID, member }: { activityID: number, member: string }) {
        assert(near.predecessorAccountId() == this.daoExpander, 'only dao expander');
        let model = { member, taskID: activityID, contractAddress: near.predecessorAccountId() } as InteractionModel;

        this.idCounter++;
        this.interactions[this.idCounter] = model;
        this.interactionsIndex[member]++;

        // emit InteractionIndexIncreased(member, interactionsIndex[member]);
    }

    // view
    @view({})
    getInteraction({ interactionID }: { interactionID: number }): InteractionModel {
        return this.interactions[interactionID];
    }
    
    @view({})
    getInteractionsIndexPerAddress({ user }: { user: string }): number {
        return this.interactionsIndex[user];
    }
}
