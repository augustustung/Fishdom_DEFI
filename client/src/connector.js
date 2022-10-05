import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
/*
import { NetworkConnector } from '@web3-react/network-connector'
import { AuthereumConnector } from '@web3-react/authereum-connector'
import { FortmaticConnector } from '@web3-react/fortmatic-connector'
import { FrameConnector } from '@web3-react/frame-connector'
import { LatticeConnector } from '@web3-react/lattice-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'
import { MagicConnector } from '@web3-react/magic-connector'
import { PortisConnector } from '@web3-react/portis-connector'
import { TorusConnector } from '@web3-react/torus-connector'
import { TrezorConnector } from '@web3-react/trezor-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
*/

import chains from './constant/chain';

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

/*

export const network = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId: 1
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'web3-react example',
  supportedChainIds: [1, 3, 4, 5, 42, 10, 137, 69, 420, 80001]
})


export const ledger = new LedgerConnector({ chainId: 1, url: RPC_URLS[1], pollingInterval: POLLING_INTERVAL })

export const trezor = new TrezorConnector({
  chainId: 1,
  url: RPC_URLS[1],
  pollingInterval: POLLING_INTERVAL,
  manifestEmail: 'dummy@abc.xyz',
  manifestAppUrl: 'http://localhost:1234'
})

export const lattice = new LatticeConnector({
  chainId: 4,
  appName: 'web3-react',
  url: RPC_URLS[4]
})

export const frame = new FrameConnector({ supportedChainIds: [1] })

export const authereum = new AuthereumConnector({ chainId: 42 })

export const fortmatic = new FortmaticConnector({ apiKey: process.env.FORTMATIC_API_KEY as string, chainId: 4 })

export const magic = new MagicConnector({
  apiKey: process.env.MAGIC_API_KEY as string,
  chainId: 4,
  email: 'hello@example.org'
})

export const portis = new PortisConnector({ dAppId: process.env.PORTIS_DAPP_ID as string, networks: [1, 100] })

export const torus = new TorusConnector({ chainId: 1 })
*/

export const connectorsByName = {
  Injected: injected,
  WalletConnect: walletconnect,
  /*
  Network: network,
  WalletLink: walletlink,
  Ledger: ledger,
  Trezor: trezor,
  Frame: frame,
  Fortmatic: fortmatic,
  Portis: portis,
  Squarelink: squarelink,
  Torus: torus,
  Authereum: authereum
  */
};
