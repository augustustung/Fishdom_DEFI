const FishdomToken = artifacts.require("FishdomToken");

module.exports = function (deployer) {
  deployer.deploy(FishdomToken, "Fishdom Token", "FdT", 1000000000);
};
