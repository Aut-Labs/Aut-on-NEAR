near-blank-project
==================

This app was initialized with [create-near-app]


Quick Start
===========

If you haven't installed dependencies during setup:

    npm install


Build and deploy your contract to TestNet with a temporary dev account:

    npm run deploy

Test your contract:

    npm test

If you have a frontend, run `npm start`. This will run a dev server.


Exploring The Code
==================

1. The smart-contract code lives in the `/contract` folder. See the README there for
   more info. In blockchain apps the smart contract is the "backend" of your app.
2. The frontend code lives in the `/frontend` folder. `/frontend/index.html` is a great
   place to start exploring. Note that it loads in `/frontend/index.js`,
   this is your entrypoint to learn how the frontend connects to the NEAR blockchain.
3. Test your contract: `npm test`, this will run the tests in `integration-tests` directory.


Deploy
======

Every smart contract in NEAR has its [own associated account][NEAR accounts]. 
When you run `npm run deploy`, your smart contract gets deployed to the live NEAR TestNet with a temporary dev account.
When you're ready to make it permanent, here's how:


Step 0: Install near-cli (optional)
-------------------------------------

[near-cli] is a command line interface (CLI) for interacting with the NEAR blockchain. It was installed to the local `node_modules` folder when you ran `npm install`, but for best ergonomics you may want to install it globally:

    npm install --global near-cli

Or, if you'd rather use the locally-installed version, you can prefix all `near` commands with `npx`

Ensure that it's installed with `near --version` (or `npx near --version`)


Step 1: Create an account for the contract
------------------------------------------

Each account on NEAR can have at most one contract deployed to it. If you've already created an account such as `your-name.testnet`, you can deploy your contract to `near-blank-project.your-name.testnet`. Assuming you've already created an account on [NEAR Wallet], here's how to create `near-blank-project.your-name.testnet`:

1. Authorize NEAR CLI, following the commands it gives you:

      near login

2. Create a subaccount (replace `YOUR-NAME` below with your actual account name):

      near create-account near-blank-project.YOUR-NAME.testnet --masterAccount YOUR-NAME.testnet

Step 2: deploy the contract
---------------------------

Use the CLI to deploy the contract to TestNet with your account ID.
Replace `PATH_TO_WASM_FILE` with the `wasm` that was generated in `contract` build directory.

    near deploy --accountId near-blank-project.YOUR-NAME.testnet --wasmFile PATH_TO_WASM_FILE


Step 3: set contract name in your frontend code
-----------------------------------------------

Modify the line in `src/config.js` that sets the account name of the contract. Set it to the account id you used above.

const CONTRACT_NAME = process.env.CONTRACT_NAME || 'near-blank-project.YOUR-NAME.testnet'



Troubleshooting
===============

On Windows, if you're seeing an error containing `EPERM` it may be related to spaces in your path. Please see [this issue](https://github.com/zkat/npx/issues/209) for more details.


  [create-near-app]: https://github.com/near/create-near-app
  [Node.js]: https://nodejs.org/en/download/package-manager/
  [jest]: https://jestjs.io/
  [NEAR accounts]: https://docs.near.org/concepts/basics/account
  [NEAR Wallet]: https://wallet.testnet.near.org/
  [near-cli]: https://github.com/near/near-cli
  [gh-pages]: https://github.com/tschaub/gh-pages


# Deploy on dev: 
===============

1. AutID
`cd /protocol/contracts/build`
`near deploy --accountId autid.migrenaa.testnet --wasmFile ./autID.wasm`
`near call autid.migrenaa.testnet init '{}' --accountId autid.migrenaa.testnet`

2. DAO Types
`cd /protocol/contracts/build`
`near deploy --accountId dao-types.migrenaa.testnet --wasmFile ./daoTypes.wasm`
`near call dao-types.migrenaa.testnet init '{}' --accountId dao-types.migrenaa.testnet`


2. Deploy an expander
`cd /protocol/contracts/build`
`near deploy --accountId dao-exp-profit-sharing.migrenaa.testnet --wasmFile ./daoExpander.wasm`
```
near call dao-exp-profit-sharing.migrenaa.testnet init '{
  "autAddr": "autid.migrenaa.testnet",
  "daoTypes": "dao-types.migrenaa.testnet",
  "daoType": 1,
  "daoAddress": "profit-sharing.sputnikv2.testnet",
  "market": 3,
  "metadata": "ipfs://bafkreib5fownnqunhrxlnn267obynjj6ydrgsmyljsfwh4bu2q4ziyjphe",
  "commitment": 3
}
' --accountId dao-exp-profit-sharing.migrenaa.testnet
```

SputnikDAO Factory
`local_near dev-deploy --wasmFile ./wasm-imports/sputnikdao_factory2.wasm`
`local_near dev-deploy <factory-account> --wasmFile=<sputnikdao-factory> --accountId <your-account>`
`local_near call <factory-account> new --accountId  <your-account> --gas 100000000000000`
```
export COUNCIL='["<council-member-1>", "<council-member-2>"]'
export ARGS=`echo '{"config": {"name": "<name>", "purpose": "<purpose>", "metadata":"<metadata>"}, "policy": '$COUNCIL'}' | base64`
local_near call  <factory-account> create "{\"name\": \"<name>\", \"args\": \"$ARGS\"}" --accountId <your-account> --amount 10 --gas 150000000000000
```
# 3. Mint a new AutID

```
near call autid.migrenaa.testnet nft_mint '{
    "username":"gabriella",
    "url":"ipfs://bafyreidmvdw6l6w6j6im32eicoihq4di54wyydq6aimwhgwag263pifwx4/metadata.json",
    "role":1,
    "commitment":5,
    "daoExpander": "dao-expander-profit-sharing.migrenaa.testnet"
}' --accountId autid.migrenaa.testnet
```

# Run local env 
kurtosis clean
~/launch-local-near-cluster.sh


# Testnet deployments:

autID: autid.migrenaa.testnet
DAOTypes: dao-types.migrenaa.testnet
daoExpander: dao-exp-profit-sharing.migrenaa.testnet
