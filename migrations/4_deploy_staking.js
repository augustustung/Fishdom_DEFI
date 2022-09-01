const FishdomMarket = artifacts.require("FishdomMarket");
const FishdomToken = artifacts.require("FishdomToken");

module.exports = async function (deployer) {
  const IFishdomToken = await FishdomToken.deployed();

  deployer.deploy(FishdomMarket, IFishdomToken.address);
};
