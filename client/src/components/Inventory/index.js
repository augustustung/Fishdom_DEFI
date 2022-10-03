import { useEffect, useState, memo, useCallback } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../const';
import './inventory.css';
import Request from '../../Axios';
import { toast } from 'react-toastify'

function Inventory({ setRoute, userData, setUserData }) {
  const [listNFT, setListNFT] = useState({ data: [], total: 0 })
  const [filter, setFilter] = useState({ skip: 0, limit: 6 })

  const fetchData = useCallback(async (filter, cb) => {
    let dataNFT = await Request.send({
      method: "POST",
      path: "/api/games/getListNFT",
      data: filter
    });
    if (dataNFT) {
      cb(dataNFT)
    }
  }, [filter])

  useEffect(() => {
    let isMounted = false
    fetchData(filter, (dataNFT) => {
      !isMounted &&
        setListNFT(dataNFT)
    })
    return () => {
      isMounted = true
    }
  }, [fetchData])

  async function handleUpdateUser(id) {
    let res = await Request.send({
      method: "POST",
      path: "/api/users/update",
      data: {
        data: {
          selectedNFT: parseInt(id)
        }
      }
    });

    if (res && res.data) {
      setUserData(res.data)
      toast.success("Selected NFT ID: " + id)
    } else {
      toast.error("Something went wrong. Please try again")
    }
  }

  async function handleOnScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (
      Math.ceil((scrollTop) + clientHeight) === scrollHeight &&
      filter.skip < listNFT.total
    ) {
      const newFilter = {
        ...filter,
        skip: filter.skip + 6
      }
      setFilter(newFilter)
      fetchData(newFilter, (dataNFT) => {
        setListNFT((prev) => ({
          total: dataNFT.total,
          data: [
            ...prev.data,
            ...dataNFT.data
          ]
        }))
      })
    }
  }

  return (
    <container>
      <canvas id="game" width={CANVAS_WIDTH} height={CANVAS_HEIGHT}></canvas>
      <div
        className="inventory-container"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT
        }}
        onScroll={handleOnScroll}
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
              return (
                <div
                  className={`
                    inventory-item 
                    ${parseInt(userData.selectedNFT) === parseInt(item.nftId) ? "used" : ""}
                  `}
                  key={item.nftId}
                >
                  <img src={`${process.env.REACT_APP_API}/api/games/idle/${item.nftId}.json`} alt="nft" />
                  <div>FdF ID: {item.nftId}</div>
                  <button onClick={() => handleUpdateUser(item.nftId)}>
                    {userData.selectedNFT === parseInt(item.nftId) ? "Used" : "Use"}
                  </button>
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
