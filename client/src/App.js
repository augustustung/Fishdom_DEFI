import { useState } from "react";
import Home from './components/Home'
import Play from './components/Play'
import LeaderBoard from './components/LeaderBoard'

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
  const [route, setRoute] = useState("/")
  const [userData, setUserData] = useState()
  let Component = LIST_ROUTE.find((item) => item.path === route)

  return (
    <>
      {<Component.render route={route} setRoute={setRoute} userData={userData} setUserData={setUserData} />}
    </>
  );
}

export default App;
