const ball = document.getElementById("ball");
const questionText = document.getElementById("questionText");
const optionsDiv = document.getElementById("options");
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");
const gameArea = document.getElementById("gameArea");
const startBtn = document.getElementById("startBtn");
const howToBtn = document.getElementById("howToBtn");
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = 700;
canvas.height = 400;

let stars = [];
for(let i=0;i<100;i++){
    stars.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*2+1, dx: Math.random()*0.5+0.2});
}

function drawStars(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let s of stars){
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx.fillStyle = "#0ff";
        ctx.fill();
        s.x -= s.dx;
        if(s.x<0) s.x=canvas.width;
    }
    requestAnimationFrame(drawStars);
}
drawStars();

let ballX, ballY, dx, dy, score, currentAnswer, gameOver, animationFrameId;
let optionButtons = [];
const keys = ['A','S','D','F'];

// Start / reset
function startGame(){
    gameArea.style.display='block';
    startBtn.style.display='none';
    ballX = 330;
    ballY = 180;
    dx = 3;
    dy = 3;
    score = 0;
    gameOver = false;
    scoreDisplay.textContent = score;
    optionsDiv.innerHTML = '';
    newQuestion();
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    moveBall();
}

// New question
function newQuestion(){
    const a = Math.floor(Math.random()*10)+1;
    const b = Math.floor(Math.random()*10)+1;
    currentAnswer = a+b;
    questionText.textContent = `${a} + ${b} = ?`;

    let answers = [currentAnswer];
    while(answers.length<4){
        let wrong = Math.floor(Math.random()*20)+2;
        if(!answers.includes(wrong)) answers.push(wrong);
    }

    answers.sort(()=>Math.random()-0.5);

    optionsDiv.innerHTML='';
    optionButtons = [];
    for(let ans of answers){
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = ans; // only numbers
        btn.dataset.value = ans;
        btn.addEventListener('click', ()=> checkAnswer(ans));
        optionsDiv.appendChild(btn);
        optionButtons.push(btn);
    }
}

// Check answer
function checkAnswer(ans){
    if(gameOver) return;
    if(ans===currentAnswer){
        dx=-dx;
        score++;
        scoreDisplay.textContent=score;
    } else {
        dx += dx>0?1:-1;
    }
    newQuestion();
}

// Ball movement
function moveBall(){
    if(gameOver) return;
    ballX += dx;
    ballY += dy;

    if(ballY<=0 || ballY>=360) dy=-dy;
    if(ballX<=0 || ballX>=660){
        gameOver=true;
        questionText.textContent="GAME OVER! Score: "+score;
        optionsDiv.innerHTML='';
        return;
    }

    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";

    animationFrameId=requestAnimationFrame(moveBall);
}

// Restart
restartBtn.addEventListener("click", startGame);
startBtn.addEventListener("click", startGame);

// Pop-up
howToBtn.addEventListener("click", ()=> popup.style.display='block');
closePopup.addEventListener("click", ()=> popup.style.display='none');

// Keyboard support A/S/D/F
document.addEventListener('keydown', (e)=>{
    if(gameOver) return;
    const key = e.key.toUpperCase();
    const idx = keys.indexOf(key);
    if(idx!==-1 && optionButtons[idx]){
        const ans = parseInt(optionButtons[idx].dataset.value);
        checkAnswer(ans);
    }
});
