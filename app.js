// Define the maze layout
const maze = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

const goalPosition = { x: 4, y: 4 };
let ballPosition = { x: 1, y: 1 };
let hasWon = false;
let isPermissionGranted = false;

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
  createMaze();
  setupMotionPermission();
});

function createMaze() {
  const mazeElement = document.querySelector('.maze');
  mazeElement.innerHTML = ''; // Clear existing content

  // Create maze cells
  maze.forEach((row, rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'maze-row';
    
    row.forEach((cell, colIndex) => {
      const cellDiv = document.createElement('div');
      cellDiv.className = `maze-cell ${cell === 1 ? 'wall' : ''} ${
        colIndex === goalPosition.x && rowIndex === goalPosition.y ? 'goal' : ''
      }`;
      rowDiv.appendChild(cellDiv);
    });
    
    mazeElement.appendChild(rowDiv);
  });

  // Create ball
  const ball = document.createElement('div');
  ball.className = 'ball';
  updateBallPosition();
  mazeElement.appendChild(ball);
}

function updateBallPosition() {
  const ball = document.querySelector('.ball');
  if (ball) {
    ball.style.transform = `translate(${ballPosition.x * 50}px, ${ballPosition.y * 50}px)`;
  }
}

function moveBall(dx, dy) {
  if (hasWon) return;

  const newX = Math.min(Math.max(ballPosition.x + dx, 0), maze[0].length - 1);
  const newY = Math.min(Math.max(ballPosition.y + dy, 0), maze.length - 1);

  // Check for wall collision
  if (maze[Math.round(newY)][Math.round(newX)] === 1) {
    ballPosition = { x: 1, y: 1 }; // Reset position
    updateBallPosition();
    return;
  }

  // Check for goal
  if (Math.round(newX) === goalPosition.x && Math.round(newY) === goalPosition.y) {
    hasWon = true;
    showWinMessage();
    return;
  }

  ballPosition = { x: newX, y: newY };
  updateBallPosition();
}

function showWinMessage() {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = 'You Win!';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function setupMotionPermission() {
  const instructionElement = document.createElement('div');
  instructionElement.className = 'instruction';
  instructionElement.textContent = 'Tap to Start';
  document.body.appendChild(instructionElement);

  // Handle iOS permission
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    document.body.addEventListener('click', async () => {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          isPermissionGranted = true;
          initMotionListeners();
          instructionElement.remove();
        }
      } catch (error) {
        console.error('Error requesting motion permission:', error);
        instructionElement.textContent = 'Motion access denied';
      }
    }, { once: true });
  } else {
    // For non-iOS devices
    isPermissionGranted = true;
    initMotionListeners();
    instructionElement.remove();
  }
}

function initMotionListeners() {
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleOrientation, true);
  }
}

function handleOrientation(event) {
  if (!isPermissionGranted || hasWon) return;

  // Get the device orientation values
  let x = event.gamma; // Left/Right tilt (-90 to 90)
  let y = event.beta;  // Front/Back tilt (-180 to 180)

  // Adjust sensitivity based on device orientation
  const isLandscape = window.innerWidth > window.innerHeight;
  if (isLandscape) {
    // Swap x and y for landscape mode
    [x, y] = [y, -x];
  }

  // Normalize and scale the values
  const moveX = (x / 45) * 0.1; // Adjust these values to change sensitivity
  const moveY = (y / 45) * 0.1;

  // Move the ball
  if (!isNaN(moveX) && !isNaN(moveY)) {
    moveBall(moveX, moveY);
  }
}

// Add resize listener to handle orientation changes
window.addEventListener('resize', () => {
  // Recalculate any necessary values based on new orientation
  updateBallPosition();
});
