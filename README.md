# HUMAN Protocol Smart Contracts on Moonbeam

This repo has the necessary files to deploy HMT escrow smart contracts to Moonbeam and Moonbase Alpha. Along with the required changes to complete the tasks described in [Issue #305 for the HUMAN Protocol](https://github.com/humanprotocol/hmt-escrow/issues/305).

### 🚀 Deploying to Moonbeam and Moonbase Alpha

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

# Fortune DAPP on Moonbase

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
      ETH_HTTP_SERVER: https://rpc.api.moonbase.moonbeam.network # CHANGED FROM GANACHE TO PUBLIC MOONBASE RPC ENDPOINT
      PORT: 3005
    command: ["yarn", "start"]

  reputation-oracle:
    build:
      context: ./reputation-oracle
    ports:
      - 3006:3006
    environment:
      ETH_PRIVATE_KEY: 657b6497a355a3982928d5515d48a84870f057c4d16923eb1d104c0afada9aa8
      ETH_HTTP_SERVER: https://rpc.api.moonbase.moonbeam.network # CHANGED FROM GANACHE TO PUBLIC MOONBASE RPC ENDPOINT
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
docker-compose up
```

### 🔮 Fortune DAPP example video on Moonbase

https://user-images.githubusercontent.com/78161484/171329675-b2107bd6-fef0-44ac-a234-9490772bb764.mp4

### 🔍 Links to the relevant scanner transactions created in the video

[Step 1 - Creating a new Escrow](https://moonbase.moonscan.io/tx/0x9e05580b89fbffc426756250835b45317da0613eb08c9f2bc30f49a33f308009)<br>
[Step 2 - Funding the Escrow with 50 testnet HMT](https://moonbase.moonscan.io/tx/0x9dd42a1138f21d09d545d39dd8ad7b0b6590a026f7387d3262fdc2428172a182)<br>
[Step 3 - Setting up Escrow](https://moonbase.moonscan.io/tx/0x45e354d5ab1c24d19464b285d784f62099927911483e285e8ea1edd47de6e8e5)<br>
[Step 4 - Workers and Oracles Payout](https://moonbase.moonscan.io/tx/0x0e9d0243c64635e588187f9b8120191a44aebef369c2f005cc01922c67a7fd4a)<br>


