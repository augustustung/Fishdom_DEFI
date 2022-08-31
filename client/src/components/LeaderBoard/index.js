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
      ctx.font = '50px Georgia';
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      // Mouse interactivity
      let canvasPosition = canvasRef.current.getBoundingClientRect();
      const mouse = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        click: false
      }
      window.addEventListener('mousemove', function (e) {
        mouse.click = true;
        mouse.x = e.x - canvasPosition.left;
        mouse.y = e.y - canvasPosition.top;
      });
      window.addEventListener('mouseup', function (e) {
        mouse.click = false;
      });

      // Player
      const playerLeft = new Image();
      playerLeft.src = '/img/fish-swim-left.png';
      const playerRight = new Image();
      playerRight.src = '/img/fish-swim-right.png';

      class Player {
        constructor() {
          this.x = CANVAS_WIDTH;
          this.y = CANVAS_HEIGHT / 2;
          this.radius = 50;
          //this.height = 20;
          this.angle = 0;
          this.frameX = 0;
          this.frameY = 0;
          this.frame = 0;
          this.spriteWidth = 160;
          this.spriteHeight = 105;
        }
        update() {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          if (mouse.x !== this.x) {
            this.x -= dx / 20;
            this.moving = true;
          }
          if (mouse.y !== this.y) {
            this.y -= dy / 20;
            this.moving = true;
          }
          if (this.x < 0) this.x = 0;
          if (this.x > CANVAS_WIDTH) this.x = CANVAS_WIDTH;
          if (this.y < 50) this.y = 50;
          if (this.y > CANVAS_HEIGHT) this.y = CANVAS_HEIGHT;
          let theta = Math.atan2(dy, dx);
          this.angle = theta;
        }
        draw() {
          if (mouse.click) {
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
          if (gameFrame % 10 === 0) {
            this.frame++;
            if (this.frame >= 12) this.frame = 0;
            if (this.frame === 3 || this.frame === 7 || this.frame === 11) {
              this.frameX = 0;
            } else this.frameX++;
            if (this.frame < 3) {
              this.frameY = 0;
            } else if (this.frame < 7) {
              this.frameY = 1;
            } else if (this.frame < 11) {
              this.frameY = 2;
            } else this.frameY = 0;
          }

          ctx.fillStyle = 'black';
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.angle);
          if (this.x >= mouse.x) {
            ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth * 0.8, this.spriteHeight * 0.8);
          } else {
            ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth * 0.8, this.spriteHeight * 0.8);
          }
          ctx.restore();
        }
      }
      const player = new Player();


      /**** BUBBLE TEXT ***/
      let bubbleTextArray = [];
      let adjustX = -3;
      let adjustY = -3;
      ctx.fillStyle = 'white';
      ctx.font = '17px Verdana';
      ctx.fillText('AQUARD TOKEN', 20, 42);
      //ctx.font = '19px Verdana';
      //ctx.fillText('TEXT', 36, 49);
      const textCoordinates = ctx.getImageData(0, 0, 100, 100);

      class Particle2 {
        constructor(x, y) {
          this.x = x;
          this.y = y;
          this.size = 7;
          this.baseX = this.x;
          this.baseY = this.y;
          this.density = (Math.random() * 15) + 1;
          this.distance = undefined;
        }
        draw() {
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(34,147,214,1)';
          ctx.fillStyle = 'rgba(255,255,255,1)';
          ctx.beginPath();
          if (this.distance < 50) {
            this.size = 14;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.arc(this.x + 4, this.y - 4, this.size / 3, 0, Math.PI * 2);
            ctx.arc(this.x - 6, this.y - 6, this.size / 5, 0, Math.PI * 2);
          } else if (this.distance <= 80) {
            this.size = 8;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.arc(this.x + 3, this.y - 3, this.size / 2.5, 0, Math.PI * 2);
            ctx.arc(this.x - 4, this.y - 4, this.size / 4.5, 0, Math.PI * 2);
          }
          else {
            this.size = 5;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.arc(this.x + 1, this.y - 1, this.size / 3, 0, Math.PI * 2);
          }
          ctx.closePath();
          ctx.fill()
        }
        update() {
          let dx = player.x - this.x;
          let dy = player.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          this.distance = distance;
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let maxDistance = 100;
          let force = (maxDistance - distance) / maxDistance;
          let directionX = forceDirectionX * force * this.density;
          let directionY = forceDirectionY * force * this.density;

          if (distance < 100) {
            this.x -= directionX;
            this.y -= directionY;
          } else {
            if (this.x !== this.baseX) {
              let dx = this.x - this.baseX;
              this.x -= dx / 20;
            }
            if (this.y !== this.baseY) {
              let dy = this.y - this.baseY;
              this.y -= dy / 20;
            }
          }
        }
      }

      function init2() {
        bubbleTextArray = [];
        for (let y = 0, y2 = textCoordinates.height; y < y2; y++) {
          for (let x = 0, x2 = textCoordinates.width; x < x2; x++) {
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
              let positionX = x + adjustX;
              let positionY = y + adjustY;
              bubbleTextArray.push(new Particle2(positionX * 8, positionY * 8));
            }
          }
        }
      }
      init2();

      /** bubble text end **/

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
        for (let i = 0; i < bubbleTextArray.length; i++) {
          bubbleTextArray[i].draw();
          bubbleTextArray[i].update();
        }
        handleBackGround();
        player.update();
        player.draw();
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
  }, [ctx])

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
                    <li key={item.userWallet}>
                      <mark>{item?.userName || ""}</mark>
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
