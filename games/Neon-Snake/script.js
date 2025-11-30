const canvas = document.getElementById("gameCanvas"),
ctx = canvas.getContext("2d"),
popup = document.getElementById("scorePopup"),
scoreText = document.getElementById("scoreText");

let size = 20, grow = 1, snake, food, dx, dy, loop, score = 0, interval = 120;

function resizeCanvas() {
const isMobile = window.innerWidth < 768;
if (isMobile) {
  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = shortSide * 0.92;
  canvas.height = shortSide * 0.92;
} else {
  canvas.width = Math.min(600, window.innerWidth * 0.95);
  canvas.height = Math.min(600, window.innerHeight * 0.7);
}
size = canvas.width / 20;
}

window.addEventListener("resize", () => {
resizeCanvas();
draw();
});

resizeCanvas();

function init() {
snake = [{x:5,y:5}];
dx = 1; dy = 0;
score = 0; interval = 120;
newFood();
popup.style.display = "none";
clearInterval(loop);
loop = setInterval(game, interval);
}

function newFood() {
food = {x: Math.floor(Math.random() * (canvas.width / size)),
      y: Math.floor(Math.random() * (canvas.height / size))};
}

function game() {
let head = {x: (snake[0].x+dx+Math.floor(canvas.width/size))%Math.floor(canvas.width/size),
          y: (snake[0].y+dy+Math.floor(canvas.height/size))%Math.floor(canvas.height/size)};
if(snake.some(p=>p.x===head.x && p.y===head.y)){ gameOver(); return; }
snake.unshift(head);
if(head.x===food.x && head.y===food.y){
  score++;
  if(score%7===0 && interval>40){ interval-=8; clearInterval(loop); loop=setInterval(game,interval); }
  newFood();
} else snake.pop();
draw();
}

function draw() {
ctx.clearRect(0,0,canvas.width,canvas.height);
snake.forEach((p,i)=>{
  ctx.fillStyle = i===0?"#ff00ff":"#00eaff";
  ctx.fillRect(p.x*size,p.y*size,size*grow-2,size*grow-2);
});
ctx.fillStyle = "#8cff00";
ctx.fillRect(food.x*size,food.y*size,size*grow-2,size*grow-2);
}

document.addEventListener("keydown", e=>{
if(e.key==="ArrowUp" && dy!==1){dx=0; dy=-1;}
if(e.key==="ArrowDown" && dy!==-1){dx=0; dy=1;}
if(e.key==="ArrowLeft" && dx!==1){dx=-1; dy=0;}
if(e.key==="ArrowRight" && dx!==-1){dx=1; dy=0;}
});

let startX = 0, startY = 0;

document.addEventListener("touchstart", e => {
if (e.target.closest('#replayBtn')) return;

e.preventDefault();
const t = e.touches[0];
startX = t.clientX;
startY = t.clientY;
}, { passive: false });

document.addEventListener("touchmove", e => {
if (e.target.closest('#replayBtn')) return;

e.preventDefault();
if (!startX || !startY) return;

let t = e.touches[0],
  dxSwipe = t.clientX - startX,
  dySwipe = t.clientY - startY;

if (Math.abs(dxSwipe) > 20 || Math.abs(dySwipe) > 20) {
  if (Math.abs(dxSwipe) > Math.abs(dySwipe)) {
      if (dxSwipe > 0 && dx !== -1) { dx = 1; dy = 0; }
      else if (dxSwipe < 0 && dx !== 1) { dx = -1; dy = 0; }
  } else {
      if (dySwipe > 0 && dy !== -1) { dx = 0; dy = 1; }
      else if (dySwipe < 0 && dy !== 1) { dx = 0; dy = -1; }
  }
  startX = 0;
  startY = 0;
}
}, { passive: false });

document.addEventListener("touchend", e => {
startX = 0;
startY = 0;
});

function gameOver() {
popup.style.display="block";
scoreText.textContent="GAME OVER! Your score: "+score;
clearInterval(loop);
}

document.getElementById("replayBtn").addEventListener("click", init);

init();
