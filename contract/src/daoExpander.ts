import { NearBindgen, near, call, view, Vector, UnorderedMap, initialize, assert } from 'near-sdk-js';

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

  @initialize({})
  init({ deployer,
    autAddr,
    daoTypes,
    daoType,
    daoAddress,
    market,
    metadata,
    commitment }: { deployer: string, autAddr: string, daoTypes: string, daoType: number, daoAddress: string, market: number, metadata: string, commitment: number }) {
    assert(daoAddress.length > 0, "Missing DAO Address");
    assert(daoTypes.length > 0, "Missing DAO Types address");
    assert(market > 0 && market < 4, "Invalid market");
    assert(metadata.length > 0, "Missing Metadata");
    assert(
      commitment > 0 && commitment < 11,
      "Commitment should be between 1 and 10"
    );
    assert(
      true,
      // IDAOTypes(_daoTypes).getMembershipCheckerAddress(
      //   _daoType
      // ) != address(0),
      "Invalid membership type"
    );
    assert(
      // IMembershipChecker(
      //   IDAOTypes(_daoTypes).getMembershipCheckerAddress(
      //     _daoType
      //   )
      // ).isMember(_daoAddr, _deployer),
      true,
      "AutID: Not a member of this DAO!"
    );
    this.daoData = {
      daoType,
      daoAddress,
      metadata,
      commitment,
      market,
      discordServer: ""
    };
    this.isCoreTeam[deployer] = true;
    this.coreTeam.push(deployer);
    this.daoTypes = daoTypes;
    this.autIDAddress = autAddr;
    this.members = new Vector('mems');
  }


  @view({})
  get_members(): Vector {
    return this.members;
  }

  @call({})
  join({ newMember }: { newMember: string }): void {
    assert(near.predecessorAccountId() == this.autIDAddress, "Only AutID can call!");
    assert(!this.isMemberOfTheDAO[newMember], "Already a member");
    assert(
      this.is_member_of_original_DAO(newMember),
      "Not a member of the DAO."
    );

    this.isMemberOfTheDAO[newMember] = true;
    this.members.push(newMember);

    //TODO: emit event
    // emit MemberAdded();
  }

  @view({})
  is_member_of_original_DAO(member: string): boolean {
    // IMembershipChecker(
    //   IDAOTypes(daoTypes).getMembershipCheckerAddress(
    //     daoData.contractType
    //   )
    // ).isMember(daoData.daoAddress, member);
    // TODO: implement
    return true;
  }

  @view({})
  is_member_of_extended_DAO(member: string): boolean {
    // IMembershipChecker(
    //   IDAOTypes(daoTypes).getMembershipCheckerAddress(
    //     daoData.contractType
    //   )
    // ).isMember(daoData.daoAddress, member);
    // TODO: implement
    return this.is_member_of_original_DAO(member) || this.isMemberOfTheDAO[member];
  }


  @view({})
  get_dao_data(): DAOData {
    // IMembershipChecker(
    //   IDAOTypes(daoTypes).getMembershipCheckerAddress(
    //     daoData.contractType
    //   )
    // ).isMember(daoData.daoAddress, member);
    // TODO: implement
    return this.daoData;
  }


  @call({})
  set_metadata(metadata: string): void {
    assert(this.isCoreTeam[near.predecessorAccountId()], "Only core team!");
    assert(metadata.length > 0, "Metadata empty");
    this.daoData.metadata = metadata;

    //TODO: emit event
    // emit MetadataUriUpdated();
  }

  @call({})
  add_to_core_team(member: string): void {
    assert(this.isCoreTeam[near.predecessorAccountId()], "Only core team!");
    assert(this.isMemberOfTheDAO[member] > 0, "not a member");
    this.isCoreTeam[member] = true;

    //TODO: emit event
    // emit CoreTeamMemberAdded(member);
  }

  @call({})
  remove_from_core_team(member: string): void {
    assert(this.isCoreTeam[near.predecessorAccountId()], "Only core team!");
    assert(this.isCoreTeam[member] > 0, "not a member");
    this.isCoreTeam[member] = false;

    for (var index = 0; index < this.coreTeam.length; index++) {
      if (this.coreTeam[index] == member) {
        this.coreTeam.swapRemove(index);
      }
    }

    //TODO: emit event
    // emit CoreTeamMemberRemoved(member);
  }

  @view({})
  get_core_team_whitelist(): Vector {
    return this.coreTeam;
  }
}
