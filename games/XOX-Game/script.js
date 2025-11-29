const board = document.getElementById('board');
let currentPlayer = 'X';
let gameOver = false;
let gameStarted = false;

for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.row = i;
    cell.dataset.col = j;
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
  }
}

const startButton = document.getElementById('start-button');
startButton.addEventListener('click', startGame);

function handleCellClick(event) {
  if (!gameStarted || gameOver) return;

  const cell = event.target;

  if (cell.textContent === '') {
    cell.textContent = currentPlayer;
    if (checkWin()) {
      alert(`${currentPlayer} wins!`);
      gameOver = true;
    } else if (checkDraw()) {
      alert('It\'s a draw!');
      gameOver = true;
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
  }
}

function checkWin() {
  const cells = document.querySelectorAll('.cell');
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]             
  ];

  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (cells[a].textContent && cells[a].textContent === cells[b].textContent && cells[a].textContent === cells[c].textContent) {
      return true;
    }
  }

  return false;
}

function checkDraw() {
  const cells = document.querySelectorAll('.cell');
  for (const cell of cells) {
    if (cell.textContent === '') {
      return false;
    }
  }
  return true;
}

function startGame() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.textContent = '';
  });

  currentPlayer = 'X';
  gameOver = false;
  gameStarted = true; 
}
