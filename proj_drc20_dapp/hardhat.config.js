require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config()
require('hardhat-deploy');
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy-ethers");

const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const ETHERSCAN_API = process.env.ETHERSCAN_API

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",  // 默认使用的网络

  // 设置网络
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY2],
      chainId: 11155111
    }
  },

  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API
    }
  },

  // 给账户起别名（外吗中可以直接 .firstAccount 拿到账户0）
  namedAccounts: {
    firstAccount: {
      default: 0
    },
    secondAccount: {
      default: 1
    },
  }

};
