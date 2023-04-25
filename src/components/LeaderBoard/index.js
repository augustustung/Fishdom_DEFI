import { useRef, useEffect, useState, memo } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../const';
import './leaderBoard.css';
import Request from '../../Axios';
let gameFrame = 0;

function LeaderBoard({ route, setRoute }) {
  const canvasRef = useRef()
  const [ctx, setCtx] = useState()
  const [dataLeaderBoard, setDataLeaderBoard] = useState([])

  useEffect(() => {
    let requestAnimationFrameId
    if (canvasRef && canvasRef.current) {
      const currentCtx = canvasRef.current.getContext('2d')
      if (currentCtx) {
        setCtx(currentCtx)
      }
    }

    if (ctx && canvasRef && canvasRef.current) {
      const background = new Image();
      background.src = window.origin + '/img/wave.png';

      const BG = {
        x1: 0,
        x2: CANVAS_WIDTH,
        y: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT
      }

      function handleBackGround() {
        BG.x1--;
        if (BG.x1 < -BG.width) {
          BG.x1 = BG.width;
        }
        BG.x2--;
        if (BG.x2 < -BG.width) {
          BG.x2 = BG.width;
        }
        ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
        ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
      }

      // animation loop
      function animate() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        handleBackGround();
        gameFrame += 1;
        gameFrame = gameFrame >= 100 ? 0 : gameFrame
        if (route === '/leader-board') {
          requestAnimationFrameId = requestAnimationFrame(animate);
        }
      }
      animate();
    }

    return () => {
      setCtx(undefined)
      window.removeEventListener('mousemove', null, true);
      window.removeEventListener('mouseup', null, true);
      cancelAnimationFrame(requestAnimationFrameId)
    }
  }, [ctx, route])

  useEffect(() => {
    async function init() {
      const res = await Request.send({
        method: "POST",
        path: "/Game/leaderboard"
      });

      if (res && res.statusCode === 200) {
        setDataLeaderBoard(res.data)
      } else {
        setDataLeaderBoard([])
      }
    }
    init()
  }, [])

  return (
    <container>
      <canvas id="game" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={canvasRef}></canvas>
      <div className="leader-board-container">
        <nav>
          <div className="leaderboard">
            <h1>
              MOST ACTIVE PLAYER
            </h1>
            <ol>
              {
                dataLeaderBoard.map(item => {
                  return (
                    <li key={item.walletAddress}>
                      <mark>{item?.walletAddress || ""}</mark>
                      <small>{item?.score || "0"}</small>
                    </li>
                  )
                })
              }
            </ol>
          </div>
          <button
            onClick={() => {
              let buttonContainer = document.querySelector(".leader-board-container")
              if (buttonContainer) {
                buttonContainer.classList.add("fade-out")
                setTimeout(() => {
                  buttonContainer.classList.add("d-none")
                }, 1000)
              }
              setTimeout(() => {
                setRoute('/')
              }, 1000)
            }}
            className='common_button'
          ></button>
        </nav>
      </div>
    </container>
  );
}

export default memo(LeaderBoard);
