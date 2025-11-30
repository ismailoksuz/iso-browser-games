(function(){
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const playBtn = document.getElementById('playBtn');
    const gameOver = document.getElementById('gameOver');

    let W = 0; let H = 0;
    let balls = [];
    let extraBalls = [];
    let bricks = [];
    let rows = 7; let cols = 10; const brickPadding = 6;
    let score = 0; let running = false;
    const paddle = { w:140, h:12, x:0, y:0 };

    function resize(){
      const header = document.querySelector('header');
      W = window.innerWidth;
      H = window.innerHeight - header.getBoundingClientRect().height;
      canvas.width = W; canvas.height = H;
      paddle.w = Math.max(90, Math.min(240, Math.floor(W*0.18)));
      paddle.x = Math.max(0, Math.min(W-paddle.w, paddle.x || (W-paddle.w)/2));
      paddle.y = H - 20;
    }
    window.addEventListener('resize', resize, {passive:true});
    resize();

    function createBall(){
      const baseSpeed = Math.max(5, Math.min(8, Math.floor(W/200)));
      return { r: Math.max(8, Math.min(14, Math.floor(W*0.02))), x: W/2, y: Math.max(40, paddle.y-20), vx: (Math.random()>0.5?1:-1)*baseSpeed, vy: -baseSpeed, speed: baseSpeed, dead:false };
    }
    function resetBalls(){ balls = [createBall()]; extraBalls = []; }

    function createBricks(){
      cols = Math.max(6, Math.floor(W/55));
      bricks = [];
      const bw = (W - (brickPadding*(cols+1))) / cols;
      const bh = Math.max(14, Math.min(28, Math.floor(W/(cols*6))));
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          const x = brickPadding + (bw + brickPadding)*c;
          const y = brickPadding + (bh + brickPadding)*r;
          bricks.push({ x, y, w: bw, h: bh, alive: true, power: 0 });
        }
      }
    }

    function resetGame(){
      score = 0;
      createBricks();
      paddle.w = Math.max(90, Math.min(240, Math.floor(W*0.18)));
      paddle.x = (W - paddle.w)/2;
      paddle.y = H - 40;
      resetBalls();
      running = false;
      playBtn.style.display = 'block';
      gameOver.style.display = 'none';
    }

    const AudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playSound(f,d,v){
      try{
        const n = AudioCtx.currentTime;
        const o = AudioCtx.createOscillator();
        const g = AudioCtx.createGain();
        o.connect(g); g.connect(AudioCtx.destination);
        g.gain.setValueAtTime(v||0.07, n);
        o.frequency.setValueAtTime(f, n);
        o.type = 'sine';
        o.start(n);
        g.gain.exponentialRampToValueAtTime(0.001, n + (d||0.08));
        o.stop(n + (d||0.08));
      }catch(e){ }
    }

    function update(){
      if(!running) return;
      const allBalls = [].concat(balls, extraBalls);
      for(const ball of allBalls){
        if(ball.dead) continue;
        ball.x += ball.vx;
        ball.y += ball.vy;
        if(ball.x - ball.r < 0){ ball.x = ball.r; ball.vx *= -1; playSound(380); }
        if(ball.x + ball.r > W){ ball.x = W - ball.r; ball.vx *= -1; playSound(380); }
        if(ball.y - ball.r < 0){ ball.y = ball.r; ball.vy *= -1; playSound(430); }
        if(ball.y + ball.r > H){ ball.dead = true; }
        if(ball.y + ball.r > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w){
          const hitPos = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
          ball.vx = ball.speed * hitPos;
          ball.vy = -Math.abs(ball.speed);
          playSound(650);
        }
      }

      balls = balls.filter(b=>!b.dead);
      extraBalls = extraBalls.filter(b=>!b.dead);

      if(balls.length === 0 && extraBalls.length === 0){
        gameOver.textContent = 'GAME OVER\nSCORE: ' + score;
        gameOver.style.display = 'block';
        running = false;
        setTimeout(resetGame, 1800);
        return;
      }

      for(const b of bricks){
        if(!b.alive) continue;
        for(const ball of [].concat(balls, extraBalls)){
          if(ball.dead) continue;
          const collided = ball.x > b.x && ball.x < b.x + b.w && ball.y - ball.r < b.y + b.h && ball.y + ball.r > b.y;
          if(collided){
            b.alive = false;
            score += 10;
            playSound(880, 0.08);
            ball.vy *= -1;
            break;
          }
        }
      }

      if(bricks.every(b=>!b.alive)){
        createBricks(); resetBalls();
      }
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = '#07102a'; ctx.fillRect(0,0,W,H);
      for(const b of bricks){
        if(!b.alive) continue;
        ctx.fillStyle = '#ff6bd6';
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
      ctx.fillStyle = '#00ffe1'; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      for(const ball of [].concat(balls, extraBalls)){
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.closePath();
      }
      ctx.fillStyle = '#fff'; ctx.font = '12px "Press Start 2P"'; ctx.fillText('SCORE: ' + score, 12, 20);
    }

    let last = 0;
    function loop(t){ last = t; update(); draw(); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);

    document.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft') paddle.x = Math.max(0, paddle.x - 50);
      if(e.key === 'ArrowRight') paddle.x = Math.min(W - paddle.w, paddle.x + 50);
    });

    let pointerDownState = false; let lastX = 0;
    function down(x){ pointerDownState = true; lastX = x; }
    function move(x){ lastX = x; }
    function up(){ pointerDownState = false; }

    window.addEventListener('pointerdown', function(e){ down(e.clientX); e.preventDefault(); });
    window.addEventListener('pointermove', function(e){ if(pointerDownState) move(e.clientX); });
    window.addEventListener('pointerup', function(e){ up(); });

    setInterval(function(){ if(pointerDownState){ const dx = lastX - (paddle.x + paddle.w/2); paddle.x += dx * 0.35; paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x)); } }, 16);

    playBtn.addEventListener('click', function(){ running = true; playBtn.style.display = 'none'; });

    resetGame();
  })();
