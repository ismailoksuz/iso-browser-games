const ball = document.getElementById("ball");
const questionText = document.getElementById("questionText");
const optionsDiv = document.getElementById("options");
const scoreDisplay = document.getElementById("score");
const scoreDisplay2 = document.getElementById("score2");
const restartBtn = document.getElementById("restartBtn");
const restartBtn2 = document.getElementById("restartBtn2");
const gameArea = document.getElementById("gameArea");
const startBtn = document.getElementById("startBtn");
const howToBtn = document.getElementById("howToBtn");
const howToBtn2 = document.getElementById("howToBtn2");
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    const rect = gameArea.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    stars = [];
    for(let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 1,
            dx: Math.random() * 0.5 + 0.2
        });
    }
}

let stars = [];

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "#0ff";
        ctx.fill();
        s.x -= s.dx;
        if(s.x < 0) s.x = canvas.width;
    }
    requestAnimationFrame(drawStars);
}

let ballX, ballY, dx, dy, score, currentAnswer, gameOver, animationFrameId;
let optionButtons = [];
const keys = ['A', 'S', 'D', 'F'];

function startGame() {
    gameArea.style.display = 'block';
    startBtn.style.display = 'none';
    
    resizeCanvas();
    drawStars();
    
    const rect = gameArea.getBoundingClientRect();
    ballX = rect.width / 2 - (rect.width * 0.03);
    ballY = rect.height / 2 - (rect.width * 0.03);
    dx = rect.width * 0.003;
    dy = rect.height * 0.005;
    
    score = 0;
    gameOver = false;
    scoreDisplay.textContent = score;
    scoreDisplay2.textContent = score;
    optionsDiv.innerHTML = '';
    newQuestion();
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    moveBall();
}

function newQuestion() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    currentAnswer = a + b;
    questionText.textContent = `${a} + ${b} = ?`;
    let answers = [currentAnswer];
    while(answers.length < 4) {
        let wrong = Math.floor(Math.random() * 20) + 2;
        if(!answers.includes(wrong)) answers.push(wrong);
    }
    answers.sort(() => Math.random() - 0.5);
    optionsDiv.innerHTML = '';
    optionButtons = [];
    for(let ans of answers) {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = ans;
        btn.dataset.value = ans;
        btn.addEventListener('click', () => checkAnswer(ans));
        optionsDiv.appendChild(btn);
        optionButtons.push(btn);
    }
}

function checkAnswer(ans) {
    if(gameOver) return;
    if(ans === currentAnswer) {
        dx = -dx;
        score++;
        scoreDisplay.textContent = score;
        scoreDisplay2.textContent = score;
    } else {
        dx += dx > 0 ? gameArea.getBoundingClientRect().width * 0.0014 : -gameArea.getBoundingClientRect().width * 0.0014;
    }
    newQuestion();
}

function moveBall() {
    if(gameOver) return;
    
    const rect = gameArea.getBoundingClientRect();
    ballX += dx;
    ballY += dy;
    
    const ballSize = rect.width * 0.06;
    
    if(ballY <= 0 || ballY >= rect.height - ballSize) dy = -dy;
    if(ballX <= 0 || ballX >= rect.width - ballSize) {
        gameOver = true;
        questionText.textContent = "GAME OVER! Score: " + score;
        optionsDiv.innerHTML = '';
        return;
    }
    
    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";
    animationFrameId = requestAnimationFrame(moveBall);
}

restartBtn.addEventListener("click", startGame);
restartBtn2.addEventListener("click", startGame);
startBtn.addEventListener("click", startGame);

howToBtn.addEventListener("click", () => popup.style.display = 'block');
howToBtn2.addEventListener("click", () => popup.style.display = 'block');
closePopup.addEventListener("click", () => popup.style.display = 'none');

document.addEventListener('keydown', (e) => {
    if(gameOver) return;
    const key = e.key.toUpperCase();
    const idx = keys.indexOf(key);
    if(idx !== -1 && optionButtons[idx]) {
        const ans = parseInt(optionButtons[idx].dataset.value);
        checkAnswer(ans);
    }
});

window.addEventListener('resize', () => {
    if(gameArea.style.display === 'block') {
        resizeCanvas();
    }
});

resizeCanvas();
drawStars();

document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('button')) {
        e.preventDefault();
    }
}, { passive: false });
