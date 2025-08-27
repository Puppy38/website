// Elements
const bird = document.getElementById('bird');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const countdownScreen = document.getElementById('countdownScreen');
const countdownText = document.getElementById('countdownText');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');

// Bird color selection and flap frames
const birdColors = {
  yellow: ['assets/flappybird.png', 'assets/flappybird.png'],
  blue: ['assets/flappybirdblue.png', 'assets/flappybirdblue.png'],
  red: ['assets/flappybirdred.png', 'assets/flappybirdred.png']
};
let currentBirdFrames = [];
let flapFrame = 0;

// Sounds
const flapSound = new Audio('assets/flap.mp3');
const scoreSound = new Audio('assets/score.mp3');
const loseSound = new Audio('assets/lose.mp3');
const swooshSound = new Audio('assets/swoosh.mp3');

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

// Background parallax
let backgroundX = 0;
const backgroundSpeed = 0.5;

// Bird bobbing
let bobAngle = 0;

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
    currentBirdFrames = birdColors[color];
    bird.src = currentBirdFrames[0];
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
    flapSound.currentTime = 0;
    flapSound.play().catch(()=>{});
    flapFrame = (flapFrame + 1) % currentBirdFrames.length;
    bird.src = currentBirdFrames[flapFrame];
  }
}
document.addEventListener('keydown', flap);
document.addEventListener('touchstart', flap);

// Create a new pipe
function createPipe(){
  const pipeHeight = Math.floor(Math.random() * (600 - pipeGap - 50)) + 25;
  const topPipe = document.createElement('img');
  topPipe.src = 'assets/pipes.png';
  topPipe.className = 'sprite';
  topPipe.style.width = pipeWidth + 'px';
  topPipe.style.height = pipeHeight + 'px';
  topPipe.style.top = '0px';
  topPipe.style.left = '400px';
  topPipe.style.transform = 'rotate(180deg)';
  document.body.appendChild(topPipe);

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

  birdVelocity += gravity;
  birdY += birdVelocity;

  // Check ground and ceiling
  if (birdY + bird.offsetHeight > 600 || birdY < 0) {
    endGame();
  }

  // Bird bobbing
  bobAngle += 0.1;
  bird.style.top = (birdY + Math.sin(bobAngle)*2) + 'px';

  // Background parallax via CSS
  backgroundX -= backgroundSpeed;
  document.body.style.backgroundPosition = `${backgroundX}px 0`;

  // Add pipes
  if(frame % 90 === 0) createPipe();

  pipes.forEach(p => {
    const left = parseFloat(p.top.style.left) - 1.5;
    p.top.style.left = left + 'px';
    p.bottom.style.left = left + 'px';

    // Collision
    const birdRect = bird.getBoundingClientRect();
    const topRect = p.top.getBoundingClientRect();
    const bottomRect = p.bottom.getBoundingClientRect();
    if((birdRect.left < topRect.right && birdRect.right > topRect.left &&
       birdRect.top < topRect.bottom && birdRect.bottom > topRect.top) ||
       (birdRect.left < bottomRect.right && birdRect.right > bottomRect.left &&
       birdRect.top < bottomRect.bottom && birdRect.bottom > bottomRect.top)) {
      endGame();
    }

    // Score
    if(!p.scored && left + pipeWidth/2 < bird.offsetLeft){
      score++;
      p.scored = true;
      scoreDisplay.innerText = score;
      scoreSound.currentTime = 0;
      scoreSound.play().catch(()=>{});
    }
  });

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
  loseSound.currentTime = 0; loseSound.play().catch(()=>{});
  swooshSound.currentTime = 0; swooshSound.play().catch(()=>{});
  const highScore = localStorage.getItem('flappyHighScore') || 0;
  if(score > highScore) localStorage.setItem('flappyHighScore', score);
  finalScore.innerText = `Score: ${score} | High Score: ${localStorage.getItem('flappyHighScore')}`;
  gameOverScreen.style.display = 'flex';
}

// Restart game
function restartGame(){
  gameOverScreen.style.display = 'none';
  startScreen.style.display = 'flex';
}
