#!/bin/sh

echo ">> Building contract"

npx near-sdk-js build src/daoExpander.ts build/daoExpander.wasm
npx near-sdk-js build src/autID.ts build/autID.wasm
npx near-sdk-js build src/membershipCheckers/DAOTypes.ts build/daoTypes.wasm
npx near-sdk-js build src/membershipCheckers/TestMembershipChecker.ts build/testMembershipChecker.wasm
npx near-sdk-js build src/interaction.ts build/interaction.wasm


cp build/daoExpander.wasm ../integration-tests/builds
cp build/autID.wasm ../integration-tests/builds
cp build/daoTypes.wasm ../integration-tests/builds
cp build/testMembershipChecker.wasm ../integration-tests/builds