import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

import chains from './chains';

/**
 * @type { [chainId: number]: string }
 */
let RPC_URLS = {};
for (let i = 0; i < chains.length; i++) {
  const chain = chains[i];
  RPC_URLS[chain.chainId] = chain.rpcUrls;
}

export const injected = new InjectedConnector({
  supportedChainIds: chains.map(item => item.chainId),
});

const POLLING_INTERVAL = 12000;
export const walletconnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
});

export const connectorsByName = {
  Injected: injected,
  // WalletConnect: walletconnect
};
