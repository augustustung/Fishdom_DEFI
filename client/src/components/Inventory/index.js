import { useRef, useEffect, useState, memo } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../const';
import './inventory.css';
// import Request from '../../Axios';

function Inventory({ route, setRoute, userData }) {
  const [listNFT, setListNFT] = useState({ data: [], total: 0 })

  useEffect(() => {
    let isMounted = false;
    async function init() {
      let resDataLeaderBoard = await Request.send({
        method: "GET",
        path: "/api/games/leader-board"
      });

      if (resDataLeaderBoard && resDataLeaderBoard.length > 0 && !isMounted) {
        setDataLeaderBoard(resDataLeaderBoard)
      } else {
        setDataLeaderBoard([])
      }
    }
    init()
    return () => {
      isMounted = true;
    }
  }, [])

  return (
    <container>
      <canvas id="game" width={CANVAS_WIDTH} height={CANVAS_HEIGHT}></canvas>
      <div
        className="inventory-container"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT
        }}
      >
        <nav>
          <button
            onClick={() => {
              setTimeout(() => {
                setRoute('/')
              }, 1000)
            }}
            className='common_button'
          >Go back</button>
        </nav>
        <div className="inventory-wapper">
          {
            listNFT.map(item => {
              return (
                <div
                  className={`
                    inventory-item 
                    ${userData.selectedNFT === item.nftId ? "used" : ""}
                  `}
                  id={item.nftId}
                >
                  <img src={item.image} alt="nft" />
                  <div>FdF ID: {item.nftId}</div>
                  <button>Use</button>
                </div>
              )
            })
          }
        </div>
      </div>
    </container>
  );
}

export default memo(Inventory);
