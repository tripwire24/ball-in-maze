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

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
  createMaze();
  initDeviceMotion();
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
  ball.style.transform = `translate(${ballPosition.x * 50}px, ${ballPosition.y * 50}px)`;
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
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = 'You Win!';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function initDeviceMotion() {
  if (window.DeviceOrientationEvent) {
    // Request permission for iOS 13+ devices
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      document.body.addEventListener('click', async () => {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
        }
      }, { once: true });
    } else {
      // Add listener directly for non-iOS devices
      window.addEventListener('deviceorientation', handleOrientation);
    }
  }
}

function handleOrientation(event) {
  // Convert orientation to movement
  const x = event.gamma / 30; // Left/Right tilt (-90 to 90)
  const y = event.beta / 30;  // Front/Back tilt (-180 to 180)
  
  if (x !== null && y !== null) {
    moveBall(x * 0.1, y * 0.1);
  }
}
