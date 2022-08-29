import { useEffect, useState } from "react";
import Home from './components/Home'
import Play from './components/Play'
import LeaderBoard from './components/LeaderBoard'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWeb3React } from "@web3-react/core";
import { hooks as metaMaskHooks } from "./connectors/metaMask";
import {
  hooks as walletConnectHooks
} from "./connectors/walletConnect";
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

const {
  useChainId: useChainIdW,
  useError: useErrorW,
  useProvider: useProviderW,
} = walletConnectHooks;

const { useChainId, useError, useProvider } = metaMaskHooks;

const LIST_ROUTE = [
  {
    path: "/",
    render: Home
  },
  {
    path: "/leader-board",
    render: LeaderBoard
  },
  {
    path: "/play",
    render: Play
  }
]


function App() {
  const [walletData, setWalletData] = useState()
  const [route, setRoute] = useState("/")
  const [userData, setUserData] = useState()
  let Component = LIST_ROUTE.find((item) => item.path === route)
  const [isConnectMetaMask, setConnectMetaMask] = useState(false);
  const [isWrongNetWork, setIsWrongNetWork] = useState(false);
  const { connector } = useWeb3React();
  const provider = useProvider();
  const providerW = useProviderW();

  const errorW = useErrorW();
  const error = useError();

  const chainId = useChainId();
  const chainIdW = useChainIdW();


  useEffect(() => {
    if (chainId && chainId != 42) {
      setIsWrongNetWork(true);
      localStorage.setItem("METAMASK_CONNECT", "");
      localStorage.setItem("WALLET_CONNECT", "");

      setWalletData(null);
      connector.deactivate();
      toast.error("Wrong network");
    } else if (chainId == 42) {
      setIsWrongNetWork(false);
    }
  }, [chainId, chainIdW]);
  //show error
  useEffect(() => {
    if (error) {
      console.log("bug metamask");
      console.log("error.name: ", error.name);

      if (error.message === "MetaMask not installed") {
        setConnectMetaMask(true);
        return;
      }
      toast.error(error.message);
    }
    if (errorW) {
      toast.error(errorW.message);
    }
  }, [error, errorW]);

  /// get signer
  useEffect(() => {
    const getSigner = async () => {
      try {
        if (provider || providerW) {
          if (provider && chainId === 42) {
            // console.log("Provider", provider);
            if (provider) {
              await provider
                .send("eth_requestAccounts", [])
                .then((data) => {
                  console.log("address: " + data);
                })
                .catch((error) => {
                  if (error.code === 4001) {
                    console.log("Please connect to MetaMask.");
                  } else {
                    console.error(error);
                  }
                });
              const signer = provider.getSigner(
                provider?.provider?.selectedAddress
              ); // You have to define your address to get away of error, because in first sight, it doesn't know what address should I sign
              setWalletData(signer);
              localStorage.setItem("METAMASK_CONNECT", "true");
              localStorage.setItem("WALLET_CONNECT", "");
            }
            return;
          }

          if (providerW && chainIdW === 42) {
            await providerW.send("eth_requestAccounts", []);
            if (providerW) {
              const signer = providerW.getSigner();
              setWalletData(signer);
              localStorage.setItem("METAMASK_CONNECT", "");
              localStorage.setItem("WALLET_CONNECT", "true");
            }
            return;
          }
        } else {
          setWalletData(null);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getSigner();
  }, [provider, providerW, chainId, chainIdW]);

  return (
    <>
      <div>{'Address: ' + walletData?._address || ""}</div>
      <Component.render
        route={route} setRoute={setRoute}
        userData={userData} setUserData={setUserData}
        walletData={walletData} setWalletData={setWalletData}
      />
      <ToastContainer />
    </>
  );
}

export default App;
