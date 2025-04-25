const socket = io();
const player1Buttons = document.querySelectorAll('#player1 .choices button');
const player2Buttons = document.querySelectorAll('#player2 .choices button');
const resultDiv = document.getElementById('result');
const replayButton = document.getElementById('replay-button');
const loadingScreen = document.getElementById('loading-screen');
const loadingIcon = document.getElementById('loading-icon');

const loadingIcons = ['✊', '✋', '✌️'];
let loadingInterval;
let loadingIndex = 0;

let playerNumber = null;
let player1Choice = null;
let player2Choice = null;


let replayRequested = false;

replayButton.addEventListener('click', () => {
  socket.emit('replay-request');
  replayRequested = true;
  replayButton.disabled = true;
  resultDiv.textContent = "Waiting for other player to accept replay...";
});

// Show replay button after game result
socket.on('game-result', (data) => {
  hideLoading();
  const winnerText = data.result;
  resultDiv.textContent = `${winnerText} Player 1 chose ${data.move1}, Player 2 chose ${data.move2}.`;
  replayButton.style.display = 'inline-block';
  replayButton.disabled = false;
  replayRequested = false;
});

// If both players accept replay
socket.on('replay-start', () => {
  player1Choice = null;
  player2Choice = null;
  resultDiv.textContent = "New round started! Make your move!";
  replayButton.style.display = 'none';
  replayRequested = false;
});

// If only one accepted replay
socket.on('waiting-replay', () => {
  resultDiv.textContent = "You accepted replay. Waiting for the other player...";
});

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
  }, 600);
}

function hideLoading() {
  clearInterval(loadingInterval);
  loadingScreen.style.display = 'none';
}

function resetGame() {
  player1Choice = null;
  player2Choice = null;
  resultDiv.textContent = "Game reset. Waiting for next round...";
}

player1Buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (playerNumber === 1 && !player1Choice) {
      player1Choice = button.textContent.toLowerCase().split(' ')[1];
      socket.emit('player-move', { player: 1, move: player1Choice });
      resultDiv.textContent = "You chose. Waiting for Player 2...";
      showLoading();
    }
  });
});

player2Buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (playerNumber === 2 && !player2Choice) {
      player2Choice = button.textContent.toLowerCase().split(' ')[1];
      socket.emit('player-move', { player: 2, move: player2Choice });
      resultDiv.textContent = "You chose. Waiting for Player 1...";
      showLoading();
    }
  });
});

socket.on('player-number', (num) => {
  playerNumber = num;
});

socket.on('game-message', (msg) => {
  resultDiv.textContent = msg;
});

socket.on('game-result', (data) => {
  hideLoading();
  const winnerText = data.result;
  resultDiv.textContent = `${winnerText}`;
  setTimeout(resetGame, 3000);
});

socket.on('room-full', () => {
  resultDiv.textContent = "Room is full. Please wait...";
});
