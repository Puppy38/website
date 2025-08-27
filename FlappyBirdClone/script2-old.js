// Elements
const bird = document.getElementById('bird');
const background = document.getElementById('background');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const countdownScreen = document.getElementById('countdownScreen');
const countdownText = document.getElementById('countdownText');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');

// Bird color selection
const birdColors = {
  yellow: 'assets/flappybird.png',
  blue: 'assets/flappybirdblue.png',
  red: 'assets/flappybirdred.png'
};

// Flap sound
const flapSound = new Audio('assets/flap.wav'); // add flap.wav to assets folder

// Game variables
let birdY = 300;
let birdVelocity = 0;
const gravity = 0.4;
const lift = -8;
let pipes = [];
const pipeGap = 220;
const pipeWidth = 50;
let frame = 0;
let score = 0;
let gameRunning = false;
let countdown = 3;

// Initialize game
function initGame() {
  birdY = 300;
  birdVelocity = 0;
  pipes.forEach(p => { if(p.top) p.top.remove(); if(p.bottom) p.bottom.remove(); });
  pipes = [];
  frame = 0;
  score = 0;
  scoreDisplay.innerText = score;
}

// Start countdown
function startCountdown(callback){
  countdownScreen.style.display = 'flex';
  countdown = 3;
  countdownText.innerText = countdown;
  const interval = setInterval(() => {
    countdown--;
    if(countdown > 0){
      countdownText.innerText = countdown;
    } else {
      clearInterval(interval);
      countdownScreen.style.display = 'none';
      callback();
    }
  }, 1000);
}

// Bird color selection
document.querySelectorAll('.colorBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.getAttribute('data-color');
    bird.src = birdColors[color];
    startScreen.style.display = 'none';
    startCountdown(() => {
      gameRunning = true;
      initGame();
      requestAnimationFrame(gameLoop);
    });
  });
});

// Flap controls
function flap() {
  if(gameRunning){
    birdVelocity = lift;
    flapSound.play();
  }
}
document.addEventListener('keydown', flap);
document.addEventListener('touchstart', flap);

// Create a new pipe
function createPipe(){
  const pipeHeight = Math.floor(Math.random() * (600 - pipeGap - 50)) + 25;

  // Top pipe
  const topPipe = document.createElement('img');
  topPipe.src = 'assets/pipes.png';
  topPipe.className = 'sprite';
  topPipe.style.width = pipeWidth + 'px';
  topPipe.style.height = pipeHeight + 'px';
  topPipe.style.top = '0px';
  topPipe.style.left = '400px';
  topPipe.style.transform = 'rotate(180deg)';
  document.body.appendChild(topPipe);

  // Bottom pipe
  const bottomPipe = document.createElement('img');
  bottomPipe.src = 'assets/pipes.png';
  bottomPipe.className = 'sprite';
  bottomPipe.style.width = pipeWidth + 'px';
  bottomPipe.style.height = (600 - pipeHeight - pipeGap) + 'px';
  bottomPipe.style.top = (pipeHeight + pipeGap) + 'px';
  bottomPipe.style.left = '400px';
  document.body.appendChild(bottomPipe);

  pipes.push({top: topPipe, bottom: bottomPipe, scored: false});
}

// Game loop
function gameLoop(){
  if(!gameRunning) return;

  // Bird physics
  birdVelocity += gravity;
  birdY += birdVelocity;
  bird.style.top = birdY + 'px';

  // Add pipes every 90 frames
  if(frame % 90 === 0){
    createPipe();
  }

  // Move pipes smoothly
  pipes.forEach(p => {
    const left = parseFloat(p.top.style.left) - 1.5;
    p.top.style.left = left + 'px';
    p.bottom.style.left = left + 'px';

    // Collision
    const birdRect = bird.getBoundingClientRect();
    const topRect = p.top.getBoundingClientRect();
    const bottomRect = p.bottom.getBoundingClientRect();

    if(birdRect.left < topRect.right && birdRect.right > topRect.left &&
       birdRect.top < topRect.bottom && birdRect.bottom > topRect.top){
         endGame();
    }
    if(birdRect.left < bottomRect.right && birdRect.right > bottomRect.left &&
       birdRect.top < bottomRect.bottom && birdRect.bottom > bottomRect.top){
         endGame();
    }

    // Scoring
    if(!p.scored && left + pipeWidth/2 < bird.offsetLeft){
      score++;
      p.scored = true;
      scoreDisplay.innerText = score;
    }
  });

  // Remove offscreen pipes
  pipes = pipes.filter(p => {
    if(parseFloat(p.top.style.left) + pipeWidth < 0){
      p.top.remove();
      p.bottom.remove();
      return false;
    }
    return true;
  });

  frame++;
  requestAnimationFrame(gameLoop);
}

// End game
function endGame(){
  gameRunning = false;
  finalScore.innerText = 'Score: ' + score;
  gameOverScreen.style.display = 'flex';
}

// Restart game
function restartGame(){
  gameOverScreen.style.display = 'none';
  startScreen.style.display = 'flex';
}
