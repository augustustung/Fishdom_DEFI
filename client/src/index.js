import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { useWeb3React, Web3ReactProvider } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { WalletConnect } from "@web3-react/walletconnect";
import { hooks as metaMaskHooks, metaMask } from "./connectors/metaMask";
import {
  hooks as walletConnectHooks,
  walletConnect,
} from "./connectors/walletConnect";

const root = ReactDOM.createRoot(document.getElementById('root'));


const connectors = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
];

function getName(connector) {
  if (connector instanceof MetaMask) return "MetaMask";
  if (connector instanceof WalletConnect) return "WalletConnect";
  return "Unknown";
}

function Child() {
  const { connector } = useWeb3React();
  console.log(`Priority Connector is: ${getName(connector)}`);
  return null;
}

root.render(
  <React.StrictMode>
    <Web3ReactProvider connectors={connectors}>
      <Child />
      <App />
    </Web3ReactProvider>

  </React.StrictMode>
);
