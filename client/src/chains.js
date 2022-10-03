const ETH = {
  name: "Ether",
  symbol: "ETH",
  decimals: 18,
};
const MATIC = {
  name: "Matic",
  symbol: "MATIC",
  decimals: 18,
};
function isExtendedChainInformation(chainInformation) {
  return !!chainInformation.nativeCurrency;
}
export function getAddChainParameters(chainId) {
  const chainInformation = CHAINS[chainId];
  if (isExtendedChainInformation(chainInformation)) {
    return {
      chainId,
      chainName: chainInformation.name,
      nativeCurrency: chainInformation.nativeCurrency,
      rpcUrls: chainInformation.urls,
      blockExplorerUrls: chainInformation.blockExplorerUrls,
    };
  } else {
    return chainId;
  }
}
export const CHAINS = {
  97: {
    urls: ["https://data-seed-prebsc-1-s3.binance.org:8545"],
    name: "BNB testnet",
  },
  // 42: {
  //   urls: ["https://kovan.infura.io/v3/"],
  //   name: "Kovan testnet",
  // },
};
export const URLS = Object.keys(CHAINS).reduce((accumulator, chainId) => {
  const validURLs = CHAINS[Number(chainId)].urls;
  if (validURLs.length) {
    accumulator[Number(chainId)] = validURLs;
  }
  return accumulator;
}, {});
