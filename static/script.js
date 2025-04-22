const player1Buttons = document.querySelectorAll('#player1 .choices button');
const player2Buttons = document.querySelectorAll('#player2 .choices button');
const resultDiv = document.getElementById('result');
const loadingScreen = document.getElementById('loading-screen');
const loadingIcon = document.getElementById('loading-icon');

const loadingIcons = ['✊', '✋', '✌️'];
let loadingInterval;
let loadingIndex = 0;


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

function checkResult() {
  if (player1Choice && player2Choice) {
    const winnerText = getWinner(player1Choice, player2Choice);
    resultDiv.textContent = winnerText;
  }
}

// Simulate Player 1 clicking
player1Buttons.forEach(button => {
    button.addEventListener('click', () => {
      player1Choice = button.textContent.toLowerCase().split(' ')[1];
      resultDiv.textContent = "Player 1 has chosen. Waiting for Player 2...";
      showLoading();
      checkResult();
    });
  });
  

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

  // Simulate Player 2 clicking
player2Buttons.forEach(button => {
    button.addEventListener('click', () => {
      player2Choice = button.textContent.toLowerCase().split(' ')[1];
      hideLoading();
      checkResult();
    });
  });
  