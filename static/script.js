const socket = io();
const player1Buttons = document.querySelectorAll('#player1 .choices button');
const player2Buttons = document.querySelectorAll('#player2 .choices button');
const resultDiv = document.getElementById('result');
const loadingScreen = document.getElementById('loading-screen');
const loadingIcon = document.getElementById('loading-icon');

const loadingIcons = ['✊', '✋', '✌️'];
let loadingInterval;
let loadingIndex = 0;

let playerNumber = null;
let player1Choice = null;
let player2Choice = null;

function getWinner(p1, p2) {
  if (p1 === p2) return "It's a draw!";
  if (
    (p1 === 'rock' && p2 === 'scissors') ||
    (p1 === 'paper' && p2 === 'rock') ||
    (p1 === 'scissors' && p2 === 'paper')
  ) {
    return "Player 1 wins!";
  } else {
    return "Player 2 wins!";
  }
}

function showLoading() {
  loadingScreen.style.display = 'flex';
  loadingIndex = 0;
  loadingIcon.textContent = loadingIcons[loadingIndex];
  loadingInterval = setInterval(() => {
    loadingIndex = (loadingIndex + 1) % loadingIcons.length;
    loadingIcon.textContent = loadingIcons[loadingIndex];
  }, 600); // change every 0.6 seconds
}

function hideLoading() {
  clearInterval(loadingInterval);
  loadingScreen.style.display = 'none';
}

function resetGame() {
  player1Choice = null;
  player2Choice = null;
  resultDiv.textContent = 'Game reset. Waiting for players...';
  // Optionally reset any other UI elements or allow players to choose again
}

player1Buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (playerNumber === 1 && player2Choice === null) {
      player1Choice = button.textContent.toLowerCase().split(' ')[1];
      socket.emit('player-move', { player: 1, move: player1Choice });
      resultDiv.textContent = "Player 1 has chosen. Waiting for Player 2...";
      showLoading();
    }
  });
});

player2Buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (playerNumber === 2 && player1Choice !== null) {
      player2Choice = button.textContent.toLowerCase().split(' ')[1];
      socket.emit('player-move', { player: 2, move: player2Choice });
      hideLoading();
      resultDiv.textContent = "Player 2 has chosen. Waiting for results...";
    }
  });
});

socket.on('player-number', (num) => {
  playerNumber = num;
  if (playerNumber === 1) {
    resultDiv.textContent = "You are Player 1. Waiting for Player 2 to join...";
  } else if (playerNumber === 2) {
    resultDiv.textContent = "You are Player 2. Waiting for Player 1 to make a move...";
  }
});

socket.on('game-message', (message) => {
  resultDiv.textContent = message;
});

socket.on('game-result', (data) => {
  player1Choice = data.move1;
  player2Choice = data.move2;
  const winnerText = getWinner(player1Choice, player2Choice);
  resultDiv.textContent = `${winnerText} Player 1 chose ${player1Choice} and Player 2 chose ${player2Choice}.`;

  // Optionally reset the game or wait for players to rejoin
  setTimeout(resetGame, 3000); // Reset after 3 seconds
});

socket.on('room-full', () => {
  resultDiv.textContent = "Room is full. Please wait...";
});
