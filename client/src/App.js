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
import { ethers } from 'ethers'
import FishTokenInstance from './contracts/FishdomToken.json'

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

  function setGlobalUserData(data) {
    if (!data) {
      setUserData(undefined)
      localStorage.removeItem('user-data')
    } else {
      setUserData(prev => {
        let formatData = {
          ...prev,
          ...data
        }
        localStorage.setItem('user-data', JSON.stringify(formatData))
        return formatData
      })
    }
  }

  useEffect(() => {
    if (chainId && chainId != 97) {
      setIsWrongNetWork(true);
      localStorage.setItem("METAMASK_CONNECT", "");
      localStorage.setItem("WALLET_CONNECT", "");

      setWalletData(null);
      // connector.deactivate();
      toast.error("Wrong network");
    } else if (chainId == 97) {
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

  useEffect(() => {
    async function init() {
      const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545")
      const signer = new ethers.Wallet(
        process.env.REACT_APP_PVK,
        provider
      );
      const smartcontract = new ethers.Contract(
        FishTokenInstance.networks[chainId].address,
        FishTokenInstance.abi, signer
      );
      console.log(walletData._address);
      let balanceOf = await smartcontract.balanceOf(walletData._address)
        .catch(err => {
          console.log(JSON.stringify(err))
        })
      setGlobalUserData({
        balanceOf: ethers.utils.formatEther(balanceOf)
      })
    }
    if (walletData) {
      init()
    }
  }, [walletData])

  /// get signer
  useEffect(() => {
    const getSigner = async () => {
      try {
        if (provider || providerW) {
          if (provider && chainId === 97) {
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

          if (providerW && chainIdW === 97) {
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

  async function handleDepositIntoGame() {
    let amount = window.prompt()
    if (!amount) {
      return;
    }

    let contractInstance = new ethers.Contract(
      FishTokenInstance.networks[chainId].address,
      FishTokenInstance.abi,
      walletData
    )

    await contractInstance.transfer(
      process.env.REACT_APP_HOST_WALLET,
      ethers.utils.parseEther(amount)
    )
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: "space-between" }}>
        <div>
          {`Address:  ${walletData?._address ? walletData?._address : ""}`}
        </div>
        <div>
          <span>
            {`FdT Balance:  ${userData?.balanceOf ? userData?.balanceOf : "0"}`}
          </span>
          <button onClick={handleDepositIntoGame}>Deposit into game</button>
        </div>
      </div>
      <Component.render
        route={route} setRoute={setRoute}
        userData={userData} setUserData={setGlobalUserData}
        walletData={walletData} setWalletData={setWalletData}
      />
      <ToastContainer />
    </>
  );
}

export default App;
