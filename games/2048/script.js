let grid;
let mergedMap;

function setup() {
    grid = [];
    mergedMap = [];
    for (let i = 0; i < 4; i++) {
        let r = [];
        let m = [];
        for (let j = 0; j < 4; j++) {
            r.push(0);
            m.push(false);
        }
        grid.push(r);
        mergedMap.push(m);
    }
    addNumber();
    addNumber();
    draw();
}

function resetMergeMap() {
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) mergedMap[i][j] = false;
}

function addNumber() {
    let o = [];
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
            if (grid[i][j] === 0) o.push({ x: i, y: j });
    if (o.length === 0) return;
    let s = o[Math.floor(Math.random() * o.length)];
    grid[s.x][s.y] = Math.random() < 0.9 ? 2 : 4;
}

function draw() {
    const game = document.getElementById("game");
    game.innerHTML = "";
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let v = grid[i][j];
            let d = document.createElement("div");
            d.className = "tile" + (v ? " n" + v : "");
            if (mergedMap[i][j]) d.classList.add("merge");
            d.textContent = v === 0 ? "" : v;
            game.appendChild(d);
        }
    }
    resizeTiles();
}

function slide(row, i) {
    row = row.filter(v => v);
    for (let x = 0; x < row.length - 1; x++) {
        if (row[x] == row[x + 1]) {
            row[x] *= 2;
            row[x + 1] = 0;
            mergedMap[i][x] = true;
        }
    }
    row = row.filter(v => v);
    while (row.length < 4) row.push(0);
    return row;
}

function rotate() {
    let n = [[], [], [], []];
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) n[i][j] = grid[j][i];
    grid = n;
}

function move(d) {
    resetMergeMap();
    let m = false;
    if (d === "LEFT") {
        for (let i = 0; i < 4; i++) {
            let r = grid[i];
            let nr = slide(r, i);
            if (nr.toString() != r.toString()) m = true;
            grid[i] = nr;
        }
    }
    if (d === "RIGHT") {
        for (let i = 0; i < 4; i++) {
            let r = grid[i].slice().reverse();
            let nr = slide(r, i).reverse();
            if (nr.toString() != grid[i].toString()) m = true;
            grid[i] = nr;
        }
    }
    if (d === "UP") {
        rotate();
        for (let i = 0; i < 4; i++) {
            let r = grid[i];
            let nr = slide(r, i);
            if (nr.toString() != r.toString()) m = true;
            grid[i] = nr;
        }
        rotate();
        rotate();
        rotate();
    }
    if (d === "DOWN") {
        rotate();
        for (let i = 0; i < 4; i++) {
            let r = grid[i].slice().reverse();
            let nr = slide(r, i).reverse();
            if (nr.toString() != grid[i].toString()) m = true;
            grid[i] = nr;
        }
        rotate();
        rotate();
        rotate();
    }
    if (m) {
        addNumber();
        draw();
        checkGameOver();
    }
}

function checkGameOver() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) return;
            if (j < 3 && grid[i][j] === grid[i][j + 1]) return;
            if (i < 3 && grid[i][j] === grid[i + 1][j]) return;
        }
    }
    showGameOver();
}

function showGameOver() {
    const overlay = document.createElement("div");
    overlay.id = "gameOverOverlay";
    overlay.innerHTML = `
        <div id="gameOverBox">
            <div id="gameOverText">GAME OVER</div>
            <button id="restartBtn">RESTART</button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById("restartBtn").addEventListener("click", restart);
}

function restart() {
    const overlay = document.getElementById("gameOverOverlay");
    if (overlay) overlay.remove();
    setup();
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") move("LEFT");
    if (e.key === "ArrowRight") move("RIGHT");
    if (e.key === "ArrowUp") move("UP");
    if (e.key === "ArrowDown") move("DOWN");
});

function stars() {
    const s = document.getElementById("stars");
    for (let i = 0; i < 120; i++) {
        let st = document.createElement("div");
        st.className = "star";
        st.style.left = Math.random() * 100 + "vw";
        let d = 2 + Math.random() * 3;
        st.style.animationDuration = d + "s";
        st.style.opacity = Math.random();
        s.appendChild(st);
    }
}

function flicks() {
    const f = document.getElementById("flickers");
    for (let i = 0; i < 15; i++) {
        let fl = document.createElement("div");
        fl.className = "flick";
        fl.style.left = Math.random() * 100 + "vw";
        fl.style.top = Math.random() * 100 + "vh";
        fl.style.animationDuration = (1 + Math.random() * 2) + "s";
        f.appendChild(fl);
    }
}

function resizeTiles() {
    const game = document.getElementById("game");
    const boardSize = game.offsetWidth;
    const tileFontSize = boardSize / 10;
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.style.fontSize = tileFontSize + "px";
    });
}

window.addEventListener("resize", () => {
    resizeTiles();
});

stars();
flicks();
setup();

let startX = 0, startY = 0;

document.addEventListener("touchstart", e => {
    if (e.target.closest('#restartBtn')) return;
    e.preventDefault();
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
}, { passive: false });

document.addEventListener("touchmove", e => {
    if (e.target.closest('#restartBtn')) return;
    e.preventDefault();
    if (!startX || !startY) return;
    let t = e.touches[0];
    let dx = t.clientX - startX;
    let dy = t.clientY - startY;
    
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) move("RIGHT");
            else move("LEFT");
        } else {
            if (dy > 0) move("DOWN");
            else move("UP");
        }
        startX = 0;
        startY = 0;
    }
}, 
{ 
    passive: false });
