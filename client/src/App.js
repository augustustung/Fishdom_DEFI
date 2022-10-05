import { useState } from "react";
import Home from './components/Home'
import Play from './components/Play'
import Inventory from './components/Inventory'
import LeaderBoard from './components/LeaderBoard'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'


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
  },
  {
    path: "/inventory",
    render: Inventory
  }
]


function App() {
  const [walletData, setWalletData] = useState()
  const [route, setRoute] = useState("/")
  const [userData, setUserData] = useState()
  let Component = LIST_ROUTE.find((item) => item.path === route)

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

  // useEffect(() => {
  //   async function init() {
  //     const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545")
  //     const signer = new ethers.Wallet(
  //       "d2d8688f0394ccd2f8cf00a7f58197a304ccecfc037966056fd1e6e224596aea",
  //       provider
  //     );
  //     const smartcontract = new ethers.Contract(
  //       FishTokenInstance.networks[chainId].address,
  //       FishTokenInstance.abi, signer
  //     );
  //     let balanceOf = await smartcontract.approve('0x5C7D6b11B0a3AC8BcD587741a3495004309265a6', ethers.utils.parseEther('1'))
  //     await balanceOf.wait(1)
  //     console.log(balanceOf);
  //   }
  //   if (walletData) {
  //     init()
  //   }
  // }, [walletData])

  return (
    <>
      <div className="info-user">
        <div>
          {`Address:  ${walletData?._address ? walletData?._address : ""}`}
        </div>
        <div>
          {`FdT Point Balance:  ${userData?.balance ? userData?.balance : "0"}`}
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
