(function() {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let W, H;
    const rotateWarning = document.getElementById('rotateWarning');

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
        if (window.innerWidth > window.innerHeight && /Mobi|Android/i.test(navigator.userAgent)) {
            rotateWarning.style.display = 'block';
        } else {
            rotateWarning.style.display = 'none';
        }
    }
    window.addEventListener('resize', resize);
    resize();

    const grid = 20;
    let player = {
            x: 5,
            y: 25,
            size: grid
        },
        obstacles = [],
        score = 0,
        running = false,
        spawnTimer = 0;
    const restartBtn = document.getElementById('restartBtn');

    function spawnObstacle() {
        const size = grid;
        obstacles.push({
            x: Math.floor(Math.random() * (W / grid)) * grid,
            y: -size,
            size: size,
            vy: grid / 8
        });
    }

    document.addEventListener('keydown', e => {
        if (!running) return;
        if (e.key === 'ArrowLeft') player.x = Math.max(0, player.x - grid);
        if (e.key === 'ArrowRight') player.x = Math.min(W - grid, player.x + grid);
    });

    let touchX = null;
    canvas.addEventListener('touchstart', e => {
        if (!running) return;
        touchX = e.touches[0].clientX;
    });
    canvas.addEventListener('touchmove', e => {
        if (!running) return;
        touchX = e.touches[0].clientX;
    });
    canvas.addEventListener('touchend', e => {
        touchX = null;
    });

    function update() {
        if (!running) return;
        spawnTimer++;
        if (spawnTimer % 15 === 0) spawnObstacle();
        for (const o of obstacles) o.y += o.vy;
        obstacles = obstacles.filter(o => o.y < H + o.size);

        if (touchX !== null) {
            const targetX = touchX - canvas.getBoundingClientRect().left - player.size / 2;
            player.x = Math.max(0, Math.min(W - grid, targetX));
        }

        for (const o of obstacles) {
            if (player.x < o.x + o.size && player.x + player.size > o.x && player.y < o.y + o.size && player.y + player.size > o.y) {
                running = false;
                restartBtn.style.display = 'block';
                restartBtn.textContent = 'GAME OVER\nSCORE: ' + score + '\nRESTART';
            }
        }
        score++;
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        const size = 10;
        for (let i = 0; i < W; i += size) {
            for (let j = 0; j < H; j += size) {
                ctx.fillStyle = ((i + j) / size) % 2 === 0 ? '#d0d0d0' : '#e0e0e0';
                ctx.fillRect(i, j, size, size);
            }
        }
        ctx.fillStyle = 'gray';
        ctx.fillRect(player.x, player.y, player.size, player.size);
        ctx.fillStyle = '#000';
        for (const o of obstacles) ctx.fillRect(o.x, o.y, o.size, o.size);
        ctx.fillStyle = '#000';
        ctx.font = '14px "Press Start 2P"';
        ctx.fillText('SCORE: ' + score, 10, 30);
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    function startGame() {
        player = {
            x: 5 * grid,
            y: 25 * grid,
            size: grid
        };
        obstacles = [];
        score = 0;
        spawnTimer = 0;
        running = true;
        document.getElementById('startBtn').style.display = 'none';
        restartBtn.style.display = 'none';
    }

    document.getElementById('startBtn').addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
})();