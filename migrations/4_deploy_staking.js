const FishdomStaking = artifacts.require("FishdomStaking");
const FishdomToken = artifacts.require("FishdomToken");

module.exports = async function (deployer) {
  const IFishdomToken = await FishdomToken.deployed();
  await deployer.deploy(FishdomStaking, IFishdomToken.address);
  await FishdomStaking.deployed()
};
