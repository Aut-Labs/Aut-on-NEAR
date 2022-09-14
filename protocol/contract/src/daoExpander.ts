import { NearBindgen, near, call, view, Vector, UnorderedMap, initialize, assert, NearPromise, bytes } from 'near-sdk-js';

const FIVE_TGAS = BigInt("50000000000000");
const NO_DEPOSIT = BigInt(0);
const NO_ARGS = bytes(JSON.stringify({}));

interface DAOData {
  daoType: number;
  daoAddress: string;
  metadata: string;
  commitment: number;
  market: number;
  discordServer: string;
}

@NearBindgen({ requireInit: true })
class DAOExpander {
  daoData: DAOData = { daoType: 0, daoAddress: '', metadata: '', commitment: 0, market: 1, discordServer: '' };
  isMemberOfTheDAO: UnorderedMap = new UnorderedMap('imotd');
  members: Vector = new Vector('mems');
  coreTeam: Vector = new Vector('ct');
  isCoreTeam: UnorderedMap = new UnorderedMap('ict');
  daoTypes: string = '';
  autIDAddress: string = '';
  deployer: string = '';
  isMemberOfOriginalDAO: UnorderedMap = new UnorderedMap('isMemberOfOriginalDAO');

  @initialize({})
  init({
    autAddr,
    daoTypes,
    daoType,
    daoAddress,
    market,
    metadata,
    commitment }: { autAddr: string, daoTypes: string, daoType: number, daoAddress: string, market: number, metadata: string, commitment: number }) {
    const deployer = near.predecessorAccountId();
    assert(daoAddress.length > 0, "Missing DAO Address");
    assert(daoTypes.length > 0, "Missing DAO Types address");
    assert(market > 0 && market < 4, "Invalid market");
    assert(metadata.length > 0, "Missing Metadata");
    assert(
      commitment > 0 && commitment < 11,
      "Commitment should be between 1 and 10"
    );

    this.daoData = {
      daoType,
      daoAddress,
      metadata,
      commitment,
      market,
      discordServer: ""
    };
    this.daoTypes = daoTypes;
    this.autIDAddress = autAddr;
    this.members = new Vector('mems');
    this.deployer = deployer;
  }

  @view({})
  getMembers(): Vector {
    return this.members;
  }

  @view({})
  isMemberOfTheOriginalDAO(member: string): boolean | NearPromise {

    // const promise = NearPromise.new(this.daoTypes)
    //   .functionCall("getMembershipCheckerAddress", bytes(JSON.stringify({ daoType: this.daoData.daoType })), NO_DEPOSIT, FIVE_TGAS)
    //   .then(
    //     NearPromise.new(near.currentAccountId())
    //       .functionCall("daoTypes_callback", bytes(JSON.stringify({
    //         member,
    //       })), NO_DEPOSIT, FIVE_TGAS)
    //   )

    // return promise.asReturn();
    return true;
  }

  @call({ privateFunction: true })
  daoTypes_callback({
    member
  }: { member: string }) {
    assert(near.promiseResultsCount() != BigInt(0), 'dao type invalid');

    const memCheckerAcc = near.promiseResult(0);
    const promise = NearPromise.new(memCheckerAcc)
      .functionCall("isMember", bytes(JSON.stringify({ member })), NO_DEPOSIT, FIVE_TGAS)
      .then(
        NearPromise.new(near.currentAccountId())
          .functionCall("membershipChecker_callback", bytes(JSON.stringify({ member })), NO_DEPOSIT, FIVE_TGAS)
      );

    return promise.asReturn();
  }

  @call({ privateFunction: true })
  membershipChecker_callback({
    member }: { member: string }) {
    if(member == this.deployer) {
      this.coreTeam.push(this.deployer);
      this.isCoreTeam.set(this.deployer, true);
    }
    return near.promiseResult(0) == 'true';
  }

  @view({})
  isMemberOfExtendedDAO(member: string): boolean {
    return this.isMemberOfOriginalDAO.get(member) == true || this.isMemberOfTheDAO.get(member) == true;
  }

  @view({})
  getDAOData(): DAOData {
    return this.daoData;
  }

  @call({})
  setMetadata(metadata: string): void {
    assert(this.isCoreTeam.get(near.predecessorAccountId()) == true, "Only core team!");
    assert(metadata.length > 0, "Metadata empty");
    this.daoData.metadata = metadata;
  }

  @call({})
  addToCoreTeam(member: string): void {
    assert(this.isCoreTeam.get(near.predecessorAccountId()) == true, "Only core team!");
    assert(this.isMemberOfTheDAO.get(member) > 0, "not a member");
    this.isCoreTeam.set(member, true);
  }

  @call({})
  removeFromCoreTeam(member: string): void {
    assert(this.isCoreTeam.get(near.predecessorAccountId()) == true, "Only core team!");
    assert(this.isMemberOfTheDAO.get(member) > 0, "not a member");
    this.isCoreTeam.set(member, false);

    for (var index = 0; index < this.coreTeam.length; index++) {
      if (this.coreTeam.get(index) == member) {
        this.coreTeam.swapRemove(index);
      }
    }
  }

  @view({})
  getCoreTeamWhitelist(): Vector {
    return Vector.deserialize(this.coreTeam);
  }
}
