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

// Initialize the game when the page loads
window.onload = function() {
    createMaze();
    requestMotionPermission();
};

function createMaze() {
    const mazeElement = document.querySelector('.maze');
    mazeElement.innerHTML = ''; // Clear existing content

    // Create maze cells
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (maze[y][x] === 1) {
                cell.classList.add('wall');
            }
            if (x === goalPosition.x && y === goalPosition.y) {
                cell.classList.add('goal');
            }
            mazeElement.appendChild(cell);
        }
    }

    // Create the ball
    const ball = document.createElement('div');
    ball.className = 'ball';
    mazeElement.appendChild(ball);
    updateBallPosition();
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
        showMessage('You Win! 🎉');
        return;
    }

    ballPosition = { x: newX, y: newY };
    updateBallPosition();
}

function showMessage(text) {
    const existing = document.querySelector('.message');
    if (existing) existing.remove();

    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;
    document.body.appendChild(message);
    
    if (text !== 'Tap to Start') {
        setTimeout(() => message.remove(), 3000);
    }
}

function requestMotionPermission() {
    showMessage('Tap to Start');
    
    document.addEventListener('click', async function initMotion() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    document.querySelector('.message').remove();
                }
            } catch (err) {
                showMessage('Motion access denied');
            }
        } else {
            // For non-iOS devices
            window.addEventListener('deviceorientation', handleOrientation);
            document.querySelector('.message').remove();
        }
        
        document.removeEventListener('click', initMotion);
    });
}

function handleOrientation(event) {
    // Get device orientation
    let x = event.gamma; // Left/Right (-90 to 90)
    let y = event.beta;  // Front/Back (-180 to 180)

    // Normalize and scale the movement
    if (x !== null && y !== null) {
        moveBall(x * 0.02, y * 0.02);
    }
}
