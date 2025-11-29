document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('startScreen');
    const gameContainer = document.getElementById('gameContainer');
    const playBtn = document.getElementById('playBtn');
    const board = document.getElementById('board');
    const timeDisplay = document.getElementById('time');
    const livesDisplay = document.getElementById('lives');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const newGameBtn = document.getElementById('newGame');
    const eraseBtn = document.getElementById('erase');
    const numberBtns = document.querySelectorAll('.number-btn');
    const gameOver = document.getElementById('gameOver');
    const gameOverTitle = document.getElementById('gameOverTitle');
    const gameOverMessage = document.getElementById('gameOverMessage');
    const restartBtn = document.getElementById('restartBtn');
    const changeDifficultyBtn = document.getElementById('changeDifficultyBtn');
    
    let selectedCell = null;
    let startTime = null;
    let timerInterval = null;
    let boardData = [];
    let solution = [];
    let initialBoard = [];
    let lives = 3;
    let selectedDifficulty = 'easy';
    let gameActive = false;
    
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDifficulty = btn.dataset.difficulty;
        });
    });
    
    playBtn.addEventListener('click', () => {
        startScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        initializeBoard();
    });
    
    function initializeBoard() {
        board.innerHTML = '';
        boardData = Array(9).fill().map(() => Array(9).fill(0));
        lives = 3;
        livesDisplay.textContent = lives;
        gameActive = true;
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if ((j + 1) % 3 === 0 && j < 8) cell.classList.add('border-right');
                if ((i + 1) % 3 === 0 && i < 8) cell.classList.add('border-bottom');
                
                cell.addEventListener('click', () => selectCell(i, j, cell));
                board.appendChild(cell);
            }
        }
        
        generateSudoku();
        startTimer();
        
        document.addEventListener('keydown', handleKeyPress);
    }
    
    function generateSudoku() {
        const difficulty = selectedDifficulty;
        let clues = 0;
        
        if (difficulty === 'easy') clues = 36;
        else if (difficulty === 'medium') clues = 30;
        else clues = 24;
        
        solveSudoku(boardData);
        solution = JSON.parse(JSON.stringify(boardData));
        
        let cells = [];
        for (let i = 0; i < 81; i++) cells.push(i);
        
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }
        
        cells = cells.slice(0, 81 - clues);
        
        for (const cell of cells) {
            const row = Math.floor(cell / 9);
            const col = cell % 9;
            boardData[row][col] = 0;
        }
        
        initialBoard = JSON.parse(JSON.stringify(boardData));
        updateBoard();
    }
    
    function solveSudoku(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    for (let i = numbers.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
                    }
                    
                    for (const num of numbers) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            
                            if (solveSudoku(board)) {
                                return true;
                            }
                            
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    function isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) {
                return false;
            }
        }
        
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    function updateBoard() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                cell.textContent = boardData[i][j] === 0 ? '' : boardData[i][j];
                
                cell.classList.remove('fixed', 'user-input', 'correct', 'incorrect');
                
                if (initialBoard[i][j] !== 0) {
                    cell.classList.add('fixed');
                } else if (boardData[i][j] !== 0) {
                    cell.classList.add('user-input');
                    
                    if (boardData[i][j] === solution[i][j]) {
                        cell.classList.add('correct');
                    } else {
                        cell.classList.add('incorrect');
                    }
                }
            }
        }
    }
    
    function selectCell(row, col, cellElement) {
        if (!gameActive) return;
        
        if (selectedCell) {
            selectedCell.classList.remove('selected');
        }
        
        if (initialBoard[row][col] === 0) {
            selectedCell = cellElement;
            selectedCell.classList.add('selected');
        }
    }
    
    function inputNumber(number) {
        if (!selectedCell || !gameActive) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        if (initialBoard[row][col] === 0) {
            boardData[row][col] = number;
            
            if (boardData[row][col] !== solution[row][col]) {
                lives--;
                livesDisplay.textContent = lives;
                
                if (lives <= 0) {
                    endGame(false);
                }
            }
            
            updateBoard();
            checkWin();
        }
    }
    
    function eraseNumber() {
        if (!selectedCell || !gameActive) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        if (initialBoard[row][col] === 0) {
            boardData[row][col] = 0;
            updateBoard();
        }
    }
    
    function checkWin() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (boardData[i][j] !== solution[i][j]) {
                    return;
                }
            }
        }
        
        endGame(true);
    }
    
    function endGame(isWin) {
        gameActive = false;
        clearInterval(timerInterval);
        
        if (isWin) {
            gameOverTitle.textContent = 'Tebrikler!';
            gameOverMessage.textContent = `Sudoku'yu ${timeDisplay.textContent} sürede tamamladınız!`;
        } else {
            gameOverTitle.textContent = 'Oyun Bitti!';
            gameOverMessage.textContent = 'Canlarınız tükendi. Tekrar deneyin!';
        }
        
        gameOver.style.display = 'flex';
    }
    
    function startTimer() {
        clearInterval(timerInterval);
        startTime = new Date();
        
        timerInterval = setInterval(() => {
            const currentTime = new Date();
            const elapsedTime = new Date(currentTime - startTime);
            
            const minutes = String(elapsedTime.getMinutes()).padStart(2, '0');
            const seconds = String(elapsedTime.getSeconds()).padStart(2, '0');
            
            timeDisplay.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }
    
    function handleKeyPress(event) {
        if (!gameActive) return;
        
        const key = event.key;
        
        if (key >= '1' && key <= '9') {
            inputNumber(parseInt(key));
        } else if (key === 'Backspace' || key === 'Delete') {
            eraseNumber();
        } else if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
            event.preventDefault();
            moveSelection(key);
        }
    }
    
    function moveSelection(direction) {
        if (!selectedCell) {
            const firstEmptyCell = document.querySelector('.cell:not(.fixed)');
            if (firstEmptyCell) {
                selectCell(
                    parseInt(firstEmptyCell.dataset.row),
                    parseInt(firstEmptyCell.dataset.col),
                    firstEmptyCell
                );
            }
            return;
        }
        
        let row = parseInt(selectedCell.dataset.row);
        let col = parseInt(selectedCell.dataset.col);
        
        switch (direction) {
            case 'ArrowUp':
                row = row > 0 ? row - 1 : 8;
                break;
            case 'ArrowDown':
                row = row < 8 ? row + 1 : 0;
                break;
            case 'ArrowLeft':
                col = col > 0 ? col - 1 : 8;
                break;
            case 'ArrowRight':
                col = col < 8 ? col + 1 : 0;
                break;
        }
        
        const newCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (newCell) {
            selectCell(row, col, newCell);
        }
    }
    
    numberBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const number = parseInt(btn.dataset.number);
            inputNumber(number);
        });
    });
    
    eraseBtn.addEventListener('click', eraseNumber);
    
    newGameBtn.addEventListener('click', () => {
        gameOver.style.display = 'none';
        clearInterval(timerInterval);
        initializeBoard();
    });
    
    restartBtn.addEventListener('click', () => {
        gameOver.style.display = 'none';
        clearInterval(timerInterval);
        initializeBoard();
    });
    
    changeDifficultyBtn.addEventListener('click', () => {
        gameOver.style.display = 'none';
        gameContainer.style.display = 'none';
        startScreen.style.display = 'block';
    });
});
