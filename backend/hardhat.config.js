require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA,
      accounts: [process.env.PRIVATE_KEY]
    },
    bnb: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: ["7ff7ef67f78c35273e0a80eb074daee8a08837a56e7a48b5d9400907ee2b2b09"]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_SEP,
      // bnbTestnet: "18UJZBF5TZTKRHFV72RBPBTEPEJ41C3YFU"
    }

  }
};
