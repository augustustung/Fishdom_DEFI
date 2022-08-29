import { useState } from "react";
import Home from './components/Home'
import Play from './components/Play'
import TopRank from './components/TopRank'

const LIST_ROUTE = [
  {
    path: "/",
    render: Home
  },
  {
    path: "/top-rank",
    render: TopRank
  },
  {
    path: "/play",
    render: Play
  }
]

function App() {
  const [route, setRoute] = useState("/")
  let Component = LIST_ROUTE.find((item) => item.path === route)

  return (
    <>
      {<Component.render setRoute={setRoute} />}
    </>
  );
}

export default App;
