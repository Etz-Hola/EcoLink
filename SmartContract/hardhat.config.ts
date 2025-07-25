import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const DEVCHAIN_MNEMONIC =
  "concert load couple harbor equip island argue ramp clarify fence smart topic";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: DEVCHAIN_MNEMONIC,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: DEVCHAIN_MNEMONIC,
      },
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 44787,
      gas: 8000000, // Increase gas limit
      gasPrice: 5000000000, // 5 gwei (higher to avoid base-fee-floor error)
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42220,
      gas: 8000000,
      gasPrice: 1000000000,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    alice: {
      default: 1,
    },
    bob: {
      default: 2,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deployments: "./deployments",
  },
  etherscan: {
    apiKey: {
      alfajores: process.env.CELO_API_KEY || "",
      celo: process.env.CELO_API_KEY || "",
    },
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
    ],
  },
};

// Task definitions
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

task(
  "devchain-keys",
  "Prints the private keys associated with the devchain",
  async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    const hdNode = hre.ethers.HDNodeWallet.fromMnemonic(
      hre.ethers.Mnemonic.fromPhrase(DEVCHAIN_MNEMONIC)
    );
    for (let i = 0; i < accounts.length; i++) {
      const account = hdNode.derivePath(`m/44'/60'/0'/0/${i}`);
      console.log(
        `Account ${i}\nAddress: ${account.address}\nKey: ${account.privateKey}`
      );
    }
  }
); 
 
task("create-account", "Prints a new private key", async (taskArgs, hre) => {
  const wallet = hre.ethers.Wallet.createRandom();
  console.log(`PRIVATE_KEY="${wallet.privateKey}"`);
  console.log(`Your account address: ${wallet.address}`);
});

task(
  "print-account",
  "Prints the address of the account associated with the private key in .env file",
  async (taskArgs, hre) => {
    if (!process.env.PRIVATE_KEY) {
      console.error("PRIVATE_KEY not set in .env");
      return;
    }
    const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY);
    console.log(`Account: ${wallet.address}`);
  }
);

export default config;