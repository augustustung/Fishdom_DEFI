import { useRef, useEffect, useState, memo } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH, REWARD_AMOUNT } from '../../const';
import './leaderBoard.css';
import moment from 'moment'

import Request from '../../Axios';
let gameFrame = 0;

function LeaderBoard({ route, setRoute }) {
  const canvasRef = useRef()
  const [ctx, setCtx] = useState()
  const [dataLeaderBoard, setDataLeaderBoard] = useState({
    leaderBoard: [], 
    rank: {}
  })

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
        setDataLeaderBoard({
          leaderBoard: [], 
          rank: {}
        })
      }
    }
    init()
  }, [])

  useEffect(() => {
    const targetDate = moment().add(1, 'month').startOf('month').toDate().getTime()
    let intervalId = setInterval(function() {
      // Get today's date and time
      let now = new Date().getTime();
    
      // Find the distance between now and the count down date
      let distance = targetDate - now;
    
      // Time calculations for days, hours, minutes and seconds
      let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
      // Display the result in the element with id="demo"
      document.getElementById("timer").innerHTML = days + "d " + hours + "h "
      + minutes + "m " + seconds + "s ";
    
      // If the count down is finished, write some text
      if (distance < 0) {
        clearInterval(intervalId);
        document.getElementById("timer").innerHTML = "EXPIRED";
      }
    }, 1000);

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <container>
      <canvas id="game" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={canvasRef}></canvas>
      <div className="leader-board-container">
        <nav>
          <div className="leaderboard">
            <div className="leaderboard-header">
              <h1>
                MOST ACTIVE PLAYER 
              </h1>
              <div>
                Next session in:&nbsp;
                <span id="timer">1d 29m 39s</span>
              </div>
            </div>

            <div className="w-100 user-rank">
              Your score: &nbsp;
              {dataLeaderBoard.rank?.score?.toLocaleString()} 
              {
                ` - Top: ${dataLeaderBoard.rank?.rank}` 
              }
              {
                parseInt(dataLeaderBoard.rank?.rank) < 5 && (
                  <>
                    &nbsp;
                    &nbsp;
                    💪 Keep going 🎉🎊
                  </>
                )
              }
            </div>
            <ol>
              {
                dataLeaderBoard.leaderBoard.map((item, index) => {
                  return (
                    <li key={item.walletAddress} onClick={() => window.open(process.env.REACT_APP_EXPLORER_URL + 'address/' + item?.walletAddress, '_blank')}>
                      <mark>
                        {item?.walletAddress.slice(0, 5) + '...' + item?.walletAddress.slice(-3)}
                        {
                          item.fullName ? ` - ${item.fullName}` : ''
                        }
                      </mark>
                      <small>
                        Earned:&nbsp;
                        {item?.score || "0"}
                        <img src="/img/point.png" alt="point" />
                      </small>
                      <small>
                        Reward:&nbsp;
                        {REWARD_AMOUNT[index]}
                        <img src="/img/point.png" alt="point" />
                      </small>
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
