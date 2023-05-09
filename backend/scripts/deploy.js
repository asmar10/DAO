const hre = require("hardhat");
const { NFT_CONTRACT_ADDRESS } = require("../constants/constants");


async function main() {

  const FakeNftMarketplace = await hre.ethers.getContractFactory("FakeNFTMarketplace");
  const fakeNftMarketplace = await FakeNftMarketplace.deploy();

  await fakeNftMarketplace.deployed();

  console.log("fakeNftMarketplace Deployed to : ", fakeNftMarketplace.address);

  const CryptoDevsDAO = await hre.ethers.getContractFactory("CryptoDevsDAO");
  const cryptoDevsDAO = await CryptoDevsDAO.deploy(fakeNftMarketplace.address, NFT_CONTRACT_ADDRESS);

  await cryptoDevsDAO.deployed();

  console.log("DAO Deployed to : ", cryptoDevsDAO.address);

  // const ArbitrumNFT = await hre.ethers.getContractFactory("ArbitrumNFT")
  // const arbitrumNFT = await ArbitrumNFT.deploy("hehe", 1)
  // await arbitrumNFT.deployed()
  // console.log(arbitrumNFT.address)
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
