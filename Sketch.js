let grid;
let cols = 8;
let rows = 8;
let jewelTypes = 4;
let cellSize;
let particles = [];
let selected = null;
let score = 0; // Initialize score variable to 0
let highScore = 0; // Initialize high score variable
let gameState = "start"; // To manage game state
let startImage; // Variable to store background image
let startSound;
let backgroundMusic; // Variable for background music
let popSound;
let GameOverSound;
let muteMusicButton; // Variable for mute music button
let restartButton; // Variable for restart button
let isMuted = false; // Flag to track if the music is muted
let startTime; // Variable to store the start time
let timeLimit = 60000; // Time limit in milliseconds (1 minute)
let borderPic;
let startTextOpacity = 255;
let startTextOpacityDirection = -1; // Direction of opacity change


function preload() {
  startImage = loadImage('bejeweled.jpg'); // Preload background image
  borderPic = loadImage ('Backpic.webp')
  startSound = loadSound('Ost.mp3'); // Preload start sound
  backgroundMusic = loadSound('Bgm.mp3'); // Preload background music
  popSound = loadSound('Pop.mp3'); // Preload pop sound
  GameOverSound = loadSound('lose.mp3');
}

function setup() {
  createCanvas(1280, 720);
  cellSize = width / 14.5;

  // Create the mute music button
  muteMusicButton = createButton('Mute Music');
  muteMusicButton.position(10, 50);
  muteMusicButton.mousePressed(toggleMute);
  muteMusicButton.style('background-color', '#ff0000');
  muteMusicButton.style('color', '#ffffff');
  muteMusicButton.style('font-size', '16px');
  muteMusicButton.style('padding', '10px');

  // Create the restart button
  restartButton = createButton('Restart Game');
  restartButton.position(10, 90);
  restartButton.mousePressed(restartGame);
  restartButton.style('background-color', '#00ff00');
  restartButton.style('color', '#ffffff');
  restartButton.style('font-size', '16px');
  restartButton.style('padding', '10px');
  restartButton.hide(); // Initially hide the restart button

  
}



function toggleMute() {
  if (isMuted) {
    backgroundMusic.setVolume(1); // Unmute
    startSound.setVolume(1);
    GameOverSound.setVolume(1);
    muteMusicButton.html('Mute Music'); // Change button text to "Mute Music"
  } else {
    backgroundMusic.setVolume(0); // Mute
    startSound.setVolume(0);
    GameOverSound.setVolume(0);
    muteMusicButton.html('Unmute Music'); // Change button text to "Unmute Music"
  }
  isMuted = !isMuted; // Toggle the mute state
}

function restartGame() {
  score = 0; // Reset the score
  grid = createGrid(cols, rows); // Reset the grid
  particles = []; // Clear particles
  selected = null; // Clear selection
  gameState = "playing"; // Set game state to playing
  startTime = millis(); // Reset the start time
}

function createGrid(cols, rows) {
  let grid = [];
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = floor(random(jewelTypes));
    }
  }
  return grid;
}

function draw() {
  if (gameState === "start") {
    drawStartScreen();
    restartButton.hide(); // Hide the restart button on start screen
  } else if (gameState === "playing") {
    restartButton.show(); // Show the restart button during gameplay
    //drawGradientBackground();
    drawBorder(); // Draw the border and background fill
    drawGrid(grid, cols, rows);
    let matches = checkForMatches();
    if (matches.length > 0) {
      createParticles(matches);
      removeMatches(matches);
    }
    updateParticles();
    drawParticles();
    drawScore(); // New function call to display the score
    drawTimeLeft(); // Display the remaining time

    if (millis() - startTime >= timeLimit) {
      if (score > highScore) {
        highScore = score; // Update high score if current score is higher
      }
      gameState = "game over"; // Switch to game over state
      GameOverSound.play();
    }
  } else if (gameState === "game over") {
    drawGameOverScreen();
    restartButton.show(); // Show the restart button in game over state
  }
}

function drawStartScreen() {
  background(startImage); // Use background image
  fill(255, startTextOpacity);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("Click to Start", width / 2, height / 2 + 250);

   // Adjust opacity based on frameCount and sine function
   startTextOpacity += startTextOpacityDirection * 5; // Change 5 to adjust blinking speed

   if (startTextOpacity <= 0 || startTextOpacity >= 255) {
     startTextOpacityDirection *= -1; // Reverse direction when opacity reaches 0 or 255
   }

  if (!backgroundMusic.isPlaying()) {
    backgroundMusic.loop(); // Play background music in a loop
  }
}



function drawBorder() {

  image (borderPic,0,0,width,height);

  let borderX = (width - cols * cellSize) / 2;
  let borderY = (height - rows * cellSize) / 2;

  fill(50); // Fill color for the background inside the border
  noStroke();
  rect(borderX, borderY, cols * cellSize, rows * cellSize);

  stroke(255); // White border color
  strokeWeight(4); // Border thickness
  noFill();
  rect(borderX, borderY, cols * cellSize, rows * cellSize);
}

function drawGrid(grid, cols, rows) {
  let offsetX = (width - cols * cellSize) / 2;
  let offsetY = (height - rows * cellSize) / 2;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (selected && selected.x === i && selected.y === j) {
        drawSelectionBox(i, j, offsetX, offsetY);
      }
      drawJewel(grid[i][j], i * cellSize + offsetX, j * cellSize + offsetY);
    }
  }
}

function drawSelectionBox(i, j, offsetX, offsetY) {
  stroke(255);
  strokeWeight(4);
  noFill();
  rect(i * cellSize + offsetX, j * cellSize + offsetY, cellSize, cellSize);
}

function drawJewel(type, x, y) {
  let half = cellSize / 2;
  push();
  translate(x + half, y + half);
  stroke(0); // Black border
  strokeWeight(2); // Border width
  fill(getJewelColor(type));
  switch (type) {
    case 0:
      ellipse(0, 0, cellSize * 0.8);
      break;
    case 1:
      rectMode(CENTER);
      rect(0, 0, cellSize * 0.8, cellSize * 0.8);
      break;
    case 2:
      triangle(
        -half * 0.8, half * 0.8,
        half * 0.8, half * 0.8,
         0, -half * 0.8
      );
      break;
    case 3:
      beginShape();
      for (let k = 0; k < 5; k++) {
        let angle = TWO_PI / 5 * k;
        let xOff = cos(angle) * half * 0.8;
        let yOff = sin(angle) * half * 0.8;
        vertex(xOff, yOff);
      }
      endShape(CLOSE);
      break;
  }
  pop();
}

function getJewelColor(type) {
  switch (type) {
    case 0: return color(255, 0, 0);
    case 1: return color(0, 255, 0);
    case 2: return color(0, 0, 255);
    case 3: return color(255, 255, 0);
  }
}

function mousePressed() {
  if (gameState === "playing") {
    let offsetX = (width - cols * cellSize) / 2;
    let offsetY = (height - rows * cellSize) / 2;
    let i = floor((mouseX - offsetX) / cellSize);
    let j = floor((mouseY - offsetY) / cellSize);

    if (selected) {
      if (isValidMove(selected, { x: i, y: j })) {
        swap(selected, { x: i, y: j });
        if (!isMatch(i, j) && !isMatch(selected.x, selected.y)) {
          swap(selected, { x: i, y: j }); // Swap back if no match
        }
        selected = null;
      } else {
        selected = { x: i, y: j };
      }
    } else {
      selected = { x: i, y: j };
    }
  } else if (gameState === "start") {
    startSound.play(); // Play start sound
    score = 0; // Reset score
    grid = createGrid(cols, rows);
    startTime = millis(); // Record the start time
    gameState = "playing"; // Switch to playing state
  }
}

function keyPressed() {
  if (keyCode === ENTER && gameState === "start") {
    startSound.play(); // Play start sound
    score = 0; // Reset score
    grid = createGrid(cols, rows);
    startTime = millis(); // Record the start time
    gameState = "playing"; // Switch to playing state
  }
}

function swap(a, b) {
  let temp = grid[a.x][a.y];
  grid[a.x][a.y] = grid[b.x][b.y];
  grid[b.x][b.y] = temp;
}

function isValidMove(a, b) {
  let dx = abs(a.x - b.x);
  let dy = abs(a.y - b.y);
  return (dx + dy === 1);
}

function isMatch(i, j) {
  let jewel = grid[i][j];
  // Check horizontally
  let matchCount = 1;
  for (let x = i - 1; x >= 0 && grid[x][j] === jewel; x--) matchCount++;
  for (let x = i + 1; x < cols && grid[x][j] === jewel; x++) matchCount++;
  if (matchCount >= 3) return true;

  // Check vertically
  matchCount = 1;
  for (let y = j - 1; y >= 0 && grid[i][y] === jewel; y--) matchCount++;
  for (let y = j + 1; y < rows && grid[i][y] === jewel; y++) matchCount++;
  return matchCount >= 3;
}

function checkForMatches() {
  let matches = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (isMatch(i, j)) {
        matches.push({ x: i, y: j });
      }
    }
  }
  return matches;
}

function createParticles(matches) {
  for (let m of matches) {
    let posX = m.x * cellSize + cellSize / 2 + (width - cols * cellSize) / 2;
    let posY = m.y * cellSize + cellSize / 2 + (height - rows * cellSize) / 2;
    for (let i = 0; i < 10; i++) {
      particles.push(new Particle(posX, posY, getJewelColor(grid[m.x][m.y])));
    }
  }
}

function removeMatches(matches) {
  for (let m of matches) {
    grid[m.x][m.y] = floor(random(jewelTypes));
    score += 10; // Increase score for each match
    popSound.play();
  }
}

function updateParticles() {
  for (let p of particles) {
    p.update();
  }
  particles = particles.filter(p => !p.isFinished());
}

function drawParticles() {
  for (let p of particles) {
    p.show();
  }
}

function drawScore() {
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);
}

function drawTimeLeft() {
  let timeLeft = timeLimit - (millis() - startTime);
  fill(255);
  textSize(24);
  textAlign(RIGHT, TOP);
  text("Time Left: " + max(0, floor(timeLeft / 1000)) + "s", width - 10, 10);
}

function drawGameOverScreen() {
  background(0);
  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2 - 50);
  textSize(36);
  text("Final Score: " + score, width / 2, height / 2 + 50);
  text("High Score: " + highScore, width / 2, height / 2 + 100); // Display high score
}

class Particle {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 5));
    this.acc = createVector(0, 0);
    this.col = col;
    this.lifespan = 255;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifespan -= 4;
  }

  show() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.lifespan);
    ellipse(this.pos.x, this.pos.y, 8);
  }

  isFinished() {
    return this.lifespan < 0;
  }
}