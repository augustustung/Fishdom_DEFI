async function switchChain(chainId) {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: chainId }],
  });
}

async function addChain({ chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls }) {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: chainId,
        chainName: chainName,
        nativeCurrency: nativeCurrency,
        rpcUrls: rpcUrls,
        blockExplorerUrls: blockExplorerUrls,
        iconUrls: [''],
      },
    ],
  });
}

export { switchChain, addChain };
