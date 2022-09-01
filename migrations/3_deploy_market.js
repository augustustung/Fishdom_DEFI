const FishdomMarket = artifacts.require("FishdomMarket");
const FishdomToken = artifacts.require("FishdomToken");
const FishdomNFT = artifacts.require("FishdomNFT");

module.exports = async function (deployer) {
  const IFishdomToken = await FishdomToken.deployed();
  const IFishdomNFT = await FishdomNFT.deployed();

  deployer.deploy(FishdomMarket, IFishdomToken.address, IFishdomNFT.address);
};
