import { useRef, useEffect, useState } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../const';
import './play.css';

let score = 0;
let gameFrame = 0;

function Play({ route }) {
  const canvasRef = useRef()
  const [ctx, setCtx] = useState()
  const [isGamePlay, setIsGamePlay] = useState(false)

  useEffect(() => {
    let isGameOver = false
    if (canvasRef && canvasRef.current) {
      const currentCtx = canvasRef.current.getContext('2d')
      if (currentCtx) {
        setCtx(currentCtx)
      }
    }

    if (ctx && canvasRef && canvasRef.current && isGamePlay) {
      ctx.font = '50px Georgia';
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      // Mouse interactivity
      let canvasPosition = canvasRef.current.getBoundingClientRect();
      const mouse = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        click: false
      }
      window.addEventListener('mousedown', function (e) {
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


      // Bubbles
      const bubblesArray = [];
      const bubble = new Image();
      bubble.src = 'https://i.ibb.co/ZX3thkw/pop2.png';
      class Bubble {
        constructor() {
          this.x = Math.random() * CANVAS_HEIGHT;
          this.y = 0 - 50 - Math.random() * CANVAS_HEIGHT / 2;
          this.radius = 50;
          this.speed = Math.random() * -5 + -1;
          this.distance = undefined;
          this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
          this.counted = false;
          this.frameX = 0;
          this.spriteWidth = 91;
          this.spriteHeight = 91;
          this.pop = false;
          this.counted = false;
        }
        update() {
          this.y -= this.speed
          const dx = this.x - player.x;
          const dy = this.y - player.y;
          this.distance = Math.sqrt(dx * dx + dy * dy);
        }
        draw() {
          /*
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();*/
          ctx.drawImage(bubble, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x - 68, this.y - 68, this.spriteWidth * 1.5, this.spriteHeight * 1.5);
        }
      }
      function handleBubbles() {
        for (let i = 0; i < bubblesArray.length; i++) {
          if (bubblesArray[i].y > CANVAS_HEIGHT * 2) {
            bubblesArray.splice(i, 1);
          }
        }
        for (let i = 0; i < bubblesArray.length; i++) {
          if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius) {
            popAndRemove(i);
          }
        }
        for (let i = 0; i < bubblesArray.length; i++) {
          bubblesArray[i].update();
          bubblesArray[i].draw();
        }
        if (gameFrame % 50 === 0) {
          bubblesArray.push(new Bubble());

        }
      }
      function popAndRemove(i) {
        if (bubblesArray[i]) {
          if (!bubblesArray[i].counted) score++;
          bubblesArray[i].counted = true;
          bubblesArray[i].frameX++;
          if (bubblesArray[i].frameX > 7) bubblesArray[i].pop = true;
          if (bubblesArray[i].pop) bubblesArray.splice(i, 1);
          requestAnimationFrame(popAndRemove);
        }

      }

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


      const enemyImage = new Image();
      enemyImage.src = '/img/__cartoon_fish_06_black_swim.png';

      class Enemy {
        constructor() {
          this.x = CANVAS_WIDTH + 200;
          this.y = Math.random() * (CANVAS_HEIGHT - 150) + 90;
          this.radius = 60;
          this.speed = Math.random() * 2 + 2;
          this.frame = 0;
          this.frameX = 0;
          this.frameY = 0;
          this.spriteWidth = 498;
          this.spriteHeight = 327;
          this.offset = {
            x: 75,
            y: 50
          }
        }

        draw() {
          ctx.drawImage(
            enemyImage, this.frameX * this.spriteWidth,
            this.frameY * this.spriteHeight,
            this.spriteWidth, this.spriteHeight,
            this.x - this.offset.x, this.y - this.offset.y, this.spriteWidth / 3, this.spriteHeight / 3
          )
        }

        update() {
          this.x -= this.speed;
          if (this.x < 0 - this.radius * 2) {
            this.x = CANVAS_HEIGHT + 200;
            this.y = Math.random() * (CANVAS_HEIGHT - 150) + 90;
            this.speed = Math.random() * 2 + 2;
          }

          if (gameFrame % 5 === 0) {
            this.frame++;
            if (this.frame >= 12) {
              this.frame = 0;
            }
            if (this.frame === 3 || this.frame === 7 || this.frame === 11) {
              this.frameX = 0;
            } else {
              this.frameX++;
            }

            if (this.frame < 3) {
              this.frameY = 0;
            } else if (this.frame < 7) {
              this.frameY = 1;
            } else if (this.frame < 11) {
              this.frameY = 2;
            } else {
              this.frameY = 0;
            }
          }


          // check collision with player
          const dx = this.x - player.x
          const dy = this.y - player.y
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < this.radius + player.radius - 10) {
            handleGameOver()
          }
        }
      }


      const enemy1 = new Enemy();

      function handleEnemies() {
        enemy1.draw();
        enemy1.update();
      }

      const killerBackground = new Image();
      killerBackground.src = '/img/killer.png'

      class Killer {
        constructor() {
          this.x = -200;
          this.y = Math.random() * (CANVAS_HEIGHT - 150) + 90;
          this.speed = Math.random() * 2 + 2;
          this.frame = 0;
          this.frameX = 0;
          this.frameY = 0;
          this.spriteWidth = 164.25;
          this.spriteHeight = 90.5;
          this.offset = {
            x: 0,
            y: 0
          }
        }

        draw() {
          ctx.drawImage(
            killerBackground, this.frameX * this.spriteWidth,
            this.frameY * this.spriteHeight,
            this.spriteWidth, this.spriteHeight,
            this.x - this.offset.x, this.y - this.offset.y, this.spriteWidth, this.spriteHeight
          )
        }

        update() {
          this.x += this.speed;
          if (this.x > CANVAS_HEIGHT + this.spriteWidth) {
            this.x = -200;
            this.y = Math.random() * (CANVAS_HEIGHT - 150) + 90;
            this.speed = Math.random() * 2 + 2;
          }

          if (gameFrame % 5 === 0) {
            this.frame++;
            if (this.frame >= 12) {
              this.frame = 0;
            }
            if (this.frame === 3 || this.frame === 7 || this.frame === 11) {
              this.frameX = 0;
            } else {
              this.frameX++;
            }

            if (this.frame < 3) {
              this.frameY = 0;
            } else if (this.frame < 7) {
              this.frameY = 1;
            } else if (this.frame < 11) {
              this.frameY = 2;
            } else {
              this.frameY = 0;
            }
          }

          // check collision with player
          if (
            this.x + this.spriteWidth + (player.spriteWidth / 4) > player.x &&
            this.x + this.spriteWidth + (player.spriteWidth / 4) < player.x + this.spriteWidth &&
            this.y - player.y < player.spriteHeight / 4 &&
            this.y - player.y > - player.spriteHeight / 4
          ) {
            handleGameOver()
          }
        }
      }

      const killer = new Killer();

      function handleKillers() {
        killer.draw();
        killer.update()
      }


      function handleGameOver() {
        let gameOverEl = document.querySelector(".gameOver")
        if (gameOverEl) {
          gameOverEl.classList.add('d-flex')
          gameOverEl.innerHTML = "GAME OVER, you reached score: " + score;
        }
        isGameOver = true
      }

      // animation loop
      function animate() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        for (let i = 0; i < bubbleTextArray.length; i++) {
          bubbleTextArray[i].draw();
          bubbleTextArray[i].update();
        }
        handleBackGround();
        handleBubbles();
        handleEnemies();
        // handleKillers();
        player.update();
        player.draw();
        ctx.fillStyle = 'rgba(34,147,214,1)';
        ctx.font = '20px Georgia';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText('score: ' + score, 141, 336);
        ctx.fillStyle = 'rgba(34,147,214,1)';
        ctx.fillText('score: ' + score, 140, 335);
        gameFrame += 1;
        gameFrame = gameFrame >= 100 ? 0 : gameFrame

        if (route === '/play' && !isGameOver) {
          requestAnimationFrame(animate);
        }
      }
      animate();
    }

    return () => {
      setCtx(undefined)
      window.removeEventListener('mousemove', null, true);
      window.removeEventListener('mouseup', null, true);
      setIsGamePlay(false)
    }
  }, [ctx, isGamePlay])

  return (
    <container>
      <canvas id="game" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={canvasRef}></canvas>
      <div onClick={() => {
        let tutorialEl = document.querySelector(".tutorial")
        if (tutorialEl) {
          tutorialEl.classList.add('d-none')
          setIsGamePlay(true)
        }
      }} className="tutorial"></div>
      <div
        className="gameOver"
        onClick={() => {
          window.location.reload()
        }}
      />
    </container>
  );
}

export default Play;
