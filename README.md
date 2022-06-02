# HUMAN Protocol Smart Contracts on Moonbeam

This repo has the necessary files to deploy HMT escrow smart contracts to Moonbeam and Moonbase Alpha. Along with the required changes to complete the tasks described in [Issue #305 for the HUMAN Protocol](https://github.com/humanprotocol/hmt-escrow/issues/305).

# 🧭 Table of contents

- [🧭 Table of contents](#-table-of-contents)
- [🚀 Deploying to Moonbeam and Moonbase Alpha](#-deploying-to-moonbeam-and-moonbase-alpha)
- - [📰 Deployed Smart Contract Addresses on Moonbeam](#-deployed-smart-contract-addresses-on-moonbeam)
  - [📰 Deployed Smart Contract Addresses on Moonbase Alpha](#-deployed-smart-contract-addresses-on-moonbase-alpha)
- [🔮 Fortune DAPP on Moonbase](#-fortune-dapp-on-moonbase)
- - [🔮 Fortune DAPP example video on Moonbase](#-fortune-dapp-example-video-on-moonbase)
  - [🔍 Links to the relevant scanner transactions created in the video](#-links-to-the-relevant-scanner-transactions-created-in-the-video)
- [💸 Cross-chain Swaps on Multichain Network (Former AnySwap)](#-cross-chain-swaps-on-multichain-network)
- - [💱 Step-by-Step swap guide](#-step-by-step-swap-guide)
  - [🔍 Links to the relevant scanner transactions created in this tutorial](#-links-to-the-relevant-scanner-transactions-created-in-this-tutorial)


# 🚀 Deploying to Moonbeam and Moonbase Alpha

In the `hmt` folder is the source code for the [hmt-escrow](https://github.com/humanprotocol/hmt-escrow) smart contracts. In order to deploy to Moonbeam and Moonbase Alpha, the following network configurations were added to the `truffle-config.js` file:

```jsx
    moonbase: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://moonbase-alpha.blastapi.io/${process.env.BLAST_API_ID}`
        ),
      network_id: 1287,
      confirmations: 2,
      timeoutBlocks: 800,
      skipDryRun: true,
    },

    moonbeam: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://moonbeam.blastapi.io/${process.env.BLAST_API_ID}`
        ),
      network_id: 1284,
      confirmations: 2,
      timeoutBlocks: 800,
      skipDryRun: false,
    },
```

This configuration uses [BlastAPI](https://blastapi.io/) RPC endpoints and a `BLAST_API_ID` environment variable must be configured on a dotenv file. Alternatively, the public RPC endpoints can be used:

```jsx
    moonbase: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://rpc.api.moonbase.moonbeam.network`
        ),
      network_id: 1287,
      confirmations: 2,
      timeoutBlocks: 800,
      skipDryRun: true,
    },

    moonbeam: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://rpc.api.moonbeam.network`
        ),
      network_id: 1284,
      confirmations: 2,
      timeoutBlocks: 800,
      skipDryRun: false,
    },
```

⚠️ ATTENTION: All smart contracts were deployed using a new wallet funded with GLMR & DEV tokens that will be delivered to the HUMAN Protocol team. **However**, the `HMToken` on Moonbeam was deployed by the [Multichain Network](https://github.com/anyswap), so we don't currently hold its ownership.


### 📰 Deployed Smart Contract Addresses on Moonbeam

```
EscrowFactory - 0x98108c28B7767a52BE38B4860832dd4e11A7ecad
HMToken - 0x3b25BC1dC591D24d60560d0135D6750A561D4764 // Deployed by Multichain Network
KVStore - 0x6617d21ab0f16A7079e2811Cf9306CAe7018bDd9
```

### 📰 Deployed Smart Contract Addresses on Moonbase Alpha

```
EscrowFactory - 0x3Cd0B117Be4CC1e31c8d7d1eD8b32208a2820902
HMToken - 0xe4C8eC5d057EacF40060b2174627a4941a5c8127
KVStore - 0x64009ca5fb4b34769F7240c6073FEc34bf5b64E3
```

# 🔮 Fortune DAPP on Moonbase

The `fortune` folder is a fork from the [fortune dapp example](https://github.com/humanprotocol/fortune) using a few tweaks to work with the smart contracts deployed on Moonbase.

Changes to `docker-compose.yml`: 

```yaml
version: '3.7'

services:

# GANACHE DELETED FROM SERVICES SINCE IT IS NOT NECESSARY

  minio:
    image: quay.io/minio/minio
    ports:
      - 9001:9001
      - 9000:9000
    environment:
      MINIO_ROOT_USER: dev
      MINIO_ROOT_PASSWORD: devdevdev
    volumes:
      - ./docker-manifest.json:/tmp/manifests/docker-manifest.json
    entrypoint: 'sh'
    command:
      -c "mkdir -p /data/manifests && cp /tmp/manifests/docker-manifest.json /data/manifests/manifest.json && minio server /data --console-address ':9001'"

  launcher:
    build:
      context: ./launcher
    ports:
      - 3000:3000
    command: ["yarn", "start-prod"]

  exchange:
    build:
      context: ./exchange
    ports:
      - 3001:3000
    command: ["yarn", "start-prod"]

  recording-oracle:
    build:
      context: ./recording-oracle
    network_mode: "host"
    environment:
      ETH_PRIVATE_KEY: 486a0621e595dd7fcbe5608cbbeec8f5a8b5cabe7637f11eccfc7acd408c3a0e
      ETH_HTTP_SERVER: https://moonbase-alpha.blastapi.io/4bb67718-93b3-4698-92ab-8a7af3f94d08 # CHANGED FROM GANACHE TO MOONBASE RPC ENDPOINT
      PORT: 3005
    command: ["yarn", "start"]

  reputation-oracle:
    build:
      context: ./reputation-oracle
    ports:
      - 3006:3006
    environment:
      ETH_PRIVATE_KEY: 657b6497a355a3982928d5515d48a84870f057c4d16923eb1d104c0afada9aa8
      ETH_HTTP_SERVER: https://moonbase-alpha.blastapi.io/4bb67718-93b3-4698-92ab-8a7af3f94d08 # CHANGED FROM GANACHE TO MOONBASE RPC ENDPOINT
      MINIO_HOST: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: dev
      MINIO_SECRET_KEY: devdevdev
      MINIO_BUCKET_NAME: job-results
      PORT: 3006
    command: ["yarn", "start"]
```

Changes to `constants.js` at `fortune/launcher/src/`: 

```jsx
export const HMT_ADDRESS = '0xe4C8eC5d057EacF40060b2174627a4941a5c8127'; // DEPLOYED HMT_ADDRESS AT MOONBASE
export const ESCROW_FACTORY_ADDRESS = '0x3Cd0B117Be4CC1e31c8d7d1eD8b32208a2820902'; // DEPLOYED ESCROW_FACTORY_ADDRESS AT MOONBASE
export const REC_ORACLE_ADDRESS = '0x61F9F0B31eacB420553da8BCC59DC617279731Ac';
export const REP_ORACLE_ADDRESS = '0xD979105297fB0eee83F7433fC09279cb5B94fFC6';
export const EXCHANGE_ORACLE_ADDRESS = '0x6b7E3C31F34cF38d1DFC1D9A8A59482028395809';
```

With the changes above, the fortune app can be started by running:

```csh
docker-compose build
docker-compose up
```

### 🔮 Fortune DAPP example video on Moonbase

https://user-images.githubusercontent.com/78161484/171329675-b2107bd6-fef0-44ac-a234-9490772bb764.mp4

### 🔍 Links to the relevant scanner transactions created in the video

[Step 1 - Creating a new Escrow](https://moonbase.moonscan.io/tx/0x9e05580b89fbffc426756250835b45317da0613eb08c9f2bc30f49a33f308009)<br>
[Step 2 - Funding the Escrow with 50 testnet HMT](https://moonbase.moonscan.io/tx/0x9dd42a1138f21d09d545d39dd8ad7b0b6590a026f7387d3262fdc2428172a182)<br>
[Step 3 - Setting up Escrow](https://moonbase.moonscan.io/tx/0x45e354d5ab1c24d19464b285d784f62099927911483e285e8ea1edd47de6e8e5)<br>
[Step 4 - Workers and Oracles Payout](https://moonbase.moonscan.io/tx/0x0e9d0243c64635e588187f9b8120191a44aebef369c2f005cc01922c67a7fd4a)<br>

# 💸 Cross-chain Swaps on Multichain Network

The Multichain Network is a cross-chain swap platform that enables HMT swaps seamlessly for different blockchains. Multichain currently supports the following chains:

```
Ethereum
Optmism
Moonbeam
```

_More chains will be added soon!_

### 💱 Step-by-Step swap guide

To use Multichain Network, visit [app.multichain.org](https://app.multichain.org/#/router) or [anyswap.exchange](https://anyswap.exchange/#/router). Both sites serve the same decentralized application and uses the same smart contracts. Go ahead and connect your preferred wallet.

<p align="center">
  <img width=80% src="https://user-images.githubusercontent.com/78161484/171486061-9d218dad-4ca4-4a1a-a56a-128b9429e8c3.png" alt="Step 01"/>
</p>

Multichain currently supports `MetaMask`, `OKEx Wallet`, `Coin98`, and `WalletConnect`. In this example, we are using `MetaMask`:

<p align="center">
  <img width=80% src="https://user-images.githubusercontent.com/78161484/171486732-af4929ff-2d6f-4e5d-b2b7-3553feafaaba.png" alt="Step 02"/>
</p>

Once the connection prompt shows up, go ahead and click on **Next** and **Connect**!

<p align="center">
  <img width=80% src="https://user-images.githubusercontent.com/78161484/171487134-298deb7b-edba-48c5-9386-deab594db734.png" alt="Step 03"/>
</p>

Ensure the wallet is connected with the correct wallet address on the top-right corner.

<p align="center">
  <img width=80% src="https://user-images.githubusercontent.com/78161484/171487337-0bd54639-d551-40cd-af93-85e84237f1a3.png" alt="Step 04"/>
</p>

Select the correct Origin Chain and Token and the correct Target Chain. In this example we are using:

```
Origin: Human Token (HMT) from Ethereum mainnet
Target: Human Token (HMT) to Moonbeam Mainet
```

By default, the swap is configured to send the funds to the same address that signs the transaction. 

<p align="center">
  <img width=80% src="https://user-images.githubusercontent.com/78161484/171488269-5b3632f1-812c-4a52-95dc-1aea20c52ca5.png" alt="Step 05"/>
</p>

```
🚨 There is also the option to send the funds to a different address than the sender's wallet. 
🚨 In that case, use the `+Send To` option on the top-right corner.
```

Enter the swap amount. The dApp will promptly estimate how much you receive on the Target chain. The transaction in the example is a little bit pricey because we are on Ethereum, but the swap fees are generally not that high. 👻

<p align="center">
  <img width=80% src="https://user-images.githubusercontent.com/78161484/171489591-49936e0c-a162-4418-bea2-6b7c49e6d628.png" alt="Step 06"/>
</p>

**Approve**: Before swapping, you need to give Multichain's Smart Contracts approval to spend your HMT tokens on your behalf. Click in `Approve` on the bottom of the page and then click in `Approve` again on the pop-up window. You will also be asked to sign the transaction on your web wallet. 

<p align="center">
  <img width=80% src="https://user-images.githubusercontent.com/78161484/171490246-fd7b3b37-0922-4440-9323-4c3909ef89d5.png" alt="Step 07"/>
</p>

**Swap**: Once the approval is confirmed on the blockchain, you will be able to send your Swap request. Click in `Swap` on the bottom of the page and then click in `Confirm` on the pop-up window. You will be asked to sign the transaction on your web wallet.

<p align="center">
  <img width=80% src="https://user-images.githubusercontent.com/78161484/171490623-69df0213-ff0f-4eb0-95bc-b5972cbff2f4.png" alt="Step 08"/>
</p>

**Transaction Receipt**: Once the transaction is sent to the blockchain, a pop-up will show your unique transaction hash used to follow the transaction status. Copy this link and remember to **SAVE/WRITE IT DOWN SOMEWHERE**. If the transaction for some reason fail, you will need that transaction hash.

<p align="center">
  <img width=40% src="https://user-images.githubusercontent.com/78161484/171507224-5b9607ab-0682-4a6d-b3a4-1224b405fd41.png" alt="Step 09"/>
</p>

The transaction is only completed when a certain number of network relayers vote to accept the transaction on the blockchain. While the transaction is pending, the Multichain transaction explorer should look like this:

<p align="center">
  <img width=80% src="https://user-images.githubusercontent.com/78161484/171507739-30b3c8de-1330-4d7a-b921-ec9f28577bfd.png" alt="Step 10"/>
</p>

This process might take from 10 to 30 minutes. After the transaction is accepted by the network, the explorer should look like this:

<p align="center">
  <img width=80% src="https://user-images.githubusercontent.com/78161484/171508010-93c32ad1-b4e0-4721-a00f-ed54806a7d1a.png" alt="Step 11"/>
</p>

**You can click on receiver address to check if the funds have been deposited!**

### 🔍 Links to the relevant scanner transactions created in this tutorial

[Step 1 - HMT Approval on Ethereum](https://etherscan.io/tx/0xc390a99893e851c41b1b542335e304daf03ed935b0884ecb2f87340c84fbd9b1)<br>
[Step 2 - Swap Request on Ethereum](https://etherscan.io/tx/0x3ba24131928fd7ffe68a22613b1612586b66ca7210d1dd0fbd45a5e5f4fc81db)<br>
[Step 3 - Funds Received on Moonbeam](https://moonscan.io/tx/0x39b230455f81a76cc5aa356b3f3ef404553b7e6e613d262a46abe677aacb947b)<br>


