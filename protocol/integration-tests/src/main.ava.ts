import { Worker, NearAccount } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';
const gasPrice = '200000000000000';
const someUrl = 'https://some.url'

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  const autID = await root.createSubAccount("aut-id");
  const daoExpander = await root.createSubAccount("dao-expander");
  const daoTypes = await root.createSubAccount("dao-types");
  const membershipChecker = await root.createSubAccount("membership-checker");
  const autIDHolder1 = await root.createSubAccount("holder-1");
  const autIDHolder2 = await root.createSubAccount("holder-2");
  const autIDHolder3 = await root.createSubAccount("holder-3");

  // Create test account alice
  await autID.deploy(process.argv[2]);
  await autID.call(autID, "init", {})

  await daoTypes.deploy("./builds/daoTypes.wasm")
  await root.call(daoTypes, "init", {})

  await membershipChecker.deploy("./builds/testMembershipChecker.wasm")
  await root.call(membershipChecker, "init", {})

  await root.call(daoTypes, "addNewMembershipChecker", { membershipChecker: membershipChecker.accountId }, { gas: gasPrice });

  await daoExpander.deploy("./builds/daoExpander.wasm")

  await root.call(daoExpander, "init", {
    deployer: root.accountId,
    autAddr: autID.accountId,
    daoTypes: daoTypes.accountId,
    daoType: 1,
    daoAddress: daoExpander.accountId,
    market: 1,
    metadata: someUrl,
    commitment: 1
  })

  t.context.worker = worker;
  t.context.accounts = {
    root,
    daoTypes,
    autID,
    daoExpander,
    autIDHolder1,
    autIDHolder2,
    autIDHolder3
  };
});

test.afterEach(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed tear down the worker:", error);
  });
});

test("mints a new AutID", async (t) => {
  const { autIDHolder1, autID, daoExpander } = t.context.accounts;

  const tokenID = await autIDHolder1.call(autID, "nft_mint", {
    username: 'Migrenaa',
    url: someUrl,
    role: 1,
    commitment: 1,
    daoExpander: daoExpander.accountId
  }, { gas: "200000000000000" }) as number;

  const token = await autID.view('nft_token', { token_id: tokenID.toString() }) as any;
  t.is(token.metadata, someUrl);
  const acc = await autID.view('getAutIDHolderByUsername', { username: 'migrenaa' });
  t.is(acc, autIDHolder1.accountId);
  const byOwner = await autID.view('getAutIDByOwner', { autIDOwner: autIDHolder1.accountId });
  t.is(byOwner, tokenID.toString());
  const memData = await autID.view('getMembershipData', { autIDHolder: autIDHolder1.accountId, daoExpander: daoExpander.accountId }) as any;
  t.is(memData.daoExpanderAddress, daoExpander.accountId);
  t.is(memData.role, 1);
  t.is(memData.commitment, 1);
  const hDAOs = await autID.view('getHolderDAOs', { autIDHolder: autIDHolder1.accountId }) as any;
  // t.is(hDAOs[0], daoExpander.accountId);
  // t.is(hDAOs.length, 1);

  // const com = await autID.view('getTotalCommitment', { autIDHolder: autIDHolder1.accountId });
  // t.is(com, 1);
});



