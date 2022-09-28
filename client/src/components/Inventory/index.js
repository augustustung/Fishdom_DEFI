import { useEffect, useState, memo } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../const';
import './inventory.css';
import Request from '../../Axios';

function Inventory({ setRoute, userData }) {
  const [listNFT, setListNFT] = useState({ data: [], total: 0 })

  useEffect(() => {
    let isMounted = false;
    async function init() {
      let dataNFT = await Request.send({
        method: "POST",
        path: "/api/games/getListNFT"
      });

      if (dataNFT && !isMounted) {
        setListNFT(dataNFT)
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
            listNFT.data.map(item => {
              console.log(item);
              return (
                <div
                  className={`
                    inventory-item 
                    ${userData.selectedNFT === item.nftId ? "used" : ""}
                  `}
                  id={item.nftId}
                >
                  <img src={`process.env.REACT_APP_API/idle${item.nftId}.json`} alt="nft" />
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
