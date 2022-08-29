
// Bubbles
const bubblesArray = [];
const bubble = new Image();
bubble.src = '/img/bubble.png';
class Bubble {
  constructor() {
    this.x = Math.random() * CANVAS_WIDTH;
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
      console.log(bubblesArray[i].distance < bubblesArray[i].radius + player.radius)
      popAndRemove(i);
    }
  }
  for (let i = 0; i < bubblesArray.length; i++) {
    bubblesArray[i].update();
    bubblesArray[i].draw();
  }
  if (gameFrame % 50 == 0) {
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




ctx.fillStyle = 'rgba(34,147,214,1)';
ctx.font = '20px Georgia';
ctx.fillStyle = 'rgba(255,255,255,0.8)';
ctx.fillText('score: ' + score, 141, 336);
ctx.fillStyle = 'rgba(34,147,214,1)';
ctx.fillText('score: ' + score, 140, 335);