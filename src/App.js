import { useEffect, useState } from "react";
import Home from './components/Home'
import Play from './components/Play'
import Inventory from './components/Inventory'
import LeaderBoard from './components/LeaderBoard'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import Request from './Axios'

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

const USER_DATA = localStorage.getItem('_u_u_u_u_u_u_') ?
  JSON.parse(localStorage.getItem('_u_u_u_u_u_u_')) :
  null

function App() {
  const [route, setRoute] = useState("/")
  const [userData, setUserData] = useState(USER_DATA)
  let Component = LIST_ROUTE.find((item) => item.path === route)

  function setGlobalUserData(data) {
    if (!data || (data && Object.keys(data).length === 0)) {
      setUserData(undefined)
      localStorage.removeItem('user-data')
    } else {
      setUserData(prev => {
        let formatData = {
          ...prev,
          ...data
        }
        localStorage.setItem('_u_u_u_u_u_u_', JSON.stringify(formatData))
        return formatData
      })
    }
  }

  useEffect(() => {
    if (userData && userData.walletAddress) {
      Request.send({
       method: "POST",
       path: '/AppUsers/getDetailByWalletAddress',
       data: {
         walletAddress: userData.walletAddress
       }
     }).then(res => {
       if (res && res.statusCode === 200) {
         setGlobalUserData(res.data)
       }
     })
    }
  }, [])

  useEffect(() => {
    const ethereum = window.ethereum
    if (ethereum) {
      const handleAccountsChanged = (accounts /*: string[] */) => {
        console.log("Handling 'accountsChanged' event with payload", accounts);
        if (accounts.length > 0) {
          localStorage.removeItem('_u_u_u_u_u_u_')
          window.location.reload()
        }      
      };
  
      ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    }
  }, [])

  return (
    <>
      <div className="info-user">
        {
          userData?.id && (
            <>
              <div>
                Account:&nbsp;
                <a href={process.env.REACT_APP_EXPLORER_URL +'address/' + userData.walletAddress} rel="noreferrer"  target="_blank">
                  {userData.walletAddress.slice(0, 5) + '...' + userData.walletAddress.slice(-3)} 
                </a>
                {
                  userData.fullName ? ` - ${userData.fullName}` : '' 
                }
              </div>
              <div style={{ display: 'flex', alignItems: 'center'}}>
                {`Point:  ${userData?.balance ? userData?.balance : "0"}`}&nbsp;
                <img src="/img/point.png" alt="point" />
              </div>
            </>
          ) 
        }
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
