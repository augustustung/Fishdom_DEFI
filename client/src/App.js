import { useState } from "react";
import Home from './components/Home'
import Play from './components/Play'
import Inventory from './components/Inventory'
import LeaderBoard from './components/LeaderBoard'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import { useWeb3React } from "@web3-react/core";


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
  const [route, setRoute] = useState("/")
  const [userData, setUserData] = useState()
  const web3Context = useWeb3React()
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

  return (
    <>
      <div className="info-user">
        <div>
          {`Address:  ${web3Context.active ? web3Context.account : ""}`}
        </div>
        <div>
          {`FdT Point Balance:  ${userData?.balance ? userData?.balance : "0"}`}
        </div>
      </div>
      <Component.render
        route={route} setRoute={setRoute}
        userData={userData} setUserData={setGlobalUserData}
      />
      <ToastContainer />
    </>
  );
}

export default App;
