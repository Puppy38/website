const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');

// Load images
const bgImg = new Image();
bgImg.src = 'flappyworld.png';

const birdImages = {
  yellow: 'flappybird.png',
  blue: 'flappybirdblue.png',
  red: 'flappybirdred.png'
};

let birdImg = new Image();
let selectedColor = 'yellow';

// Load pipe image
const pipeImg = new Image();
pipeImg.src = 'assets/pipes.png';

// Load flap sound
const flapSound = new Audio('flap.wav'); // Make sure to add flap.wav to assets

// Game variables
let bird, pipes, frame, score, gameRunning;

// Initialize game
function initGame() {
  bird = { x: 50, y: 300, width: 34, height: 24, gravity: 0.6, lift: -12, velocity: 0 };
  pipes = [];
  frame = 0;
  score = 0;
  gameRunning = false;
  scoreDisplay.innerText = score;
}

// Start screen bird selection
document.querySelectorAll('.colorBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedColor = btn.getAttribute('data-color');
    birdImg.src = birdImages[selectedColor];
    startScreen.style.display = 'none';
    gameRunning = true;
    initGame();
    draw();
  });
});

// Key press
document.addEventListener('keydown', () => {
  if(gameRunning) {
    bird.velocity = bird.lift;
    flapSound.play();
  }
});

// Game loop
function draw() {
  if(!gameRunning) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);

  // Bird physics
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  // Add pipes
  if(frame % 90 === 0) {
    let pipeHeight = Math.floor(Math.random() * (canvas.height - 150 - 50)) + 25;
    pipes.push({x: canvas.width, y:0, height:pipeHeight, scored:false});
    pipes.push({x: canvas.width, y:pipeHeight+150, height:canvas.height - pipeHeight - 150, scored:false});
  }

  // Draw pipes
  pipes.forEach(p => {
    p.x -= 2;
    ctx.drawImage(pipeImg, p.x, p.y, 50, p.height);

    // Collision
    if(bird.x < p.x+50 && bird.x+bird.width > p.x &&
       bird.y < p.y+p.height && bird.y+bird.height > p.y) {
         endGame();
    }

    // Score
    if(!p.scored && p.y === 0 && bird.x > p.x+50){
      score++;
      p.scored = true;
      scoreDisplay.innerText = score;
    }
  });

  // Remove offscreen pipes
  pipes = pipes.filter(p => p.x + 50 > 0);

  frame++;
  requestAnimationFrame(draw);
}

// End game
function endGame() {
  gameRunning = false;
  finalScore.innerText = 'Score: ' + score;
  gameOverScreen.style.display = 'flex';
}

// Restart game
function restartGame() {
  gameOverScreen.style.display = 'none';
  startScreen.style.display = 'flex';
}

initGame();
