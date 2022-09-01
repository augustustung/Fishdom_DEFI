const FishdomNFT = artifacts.require("FishdomNFT");

module.exports = function (deployer) {
  deployer.deploy(FishdomNFT, "Fishdom Fish", "FdF", "https://mydomain.com/metadata/");
};
