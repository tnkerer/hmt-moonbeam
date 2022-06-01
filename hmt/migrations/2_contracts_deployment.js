// import build artifacts

const HMToken = artifacts.require("HMToken");
const KVStore = artifacts.require("KVStore");
const EscrowFactory = artifacts.require("EscrowFactory");

// deploy contracts

module.exports = function (deployer) {
  deployer.then(async () => {
/*     await deployer.deploy(HMToken,
        1000000000,
        "Human Token",
        18,
        "HMT"
        ); */
    await deployer.deploy(EscrowFactory, '0x3b25BC1dC591D24d60560d0135D6750A561D4764');
    await deployer.deploy(KVStore);
  });
};

// Moonbase Alpha Testnet
// EscrowFactory: 0x3Cd0B117Be4CC1e31c8d7d1eD8b32208a2820902
// HMToken: 0xe4C8eC5d057EacF40060b2174627a4941a5c8127
// KVStore: 0x64009ca5fb4b34769F7240c6073FEc34bf5b64E3

// Moonbeam Mainet
// EscrowFactory: 0x98108c28B7767a52BE38B4860832dd4e11A7ecad
// HMToken: 0x3b25BC1dC591D24d60560d0135D6750A561D4764
// KVStore: 0x6617d21ab0f16A7079e2811Cf9306CAe7018bDd9


