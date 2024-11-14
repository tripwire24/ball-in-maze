import React, { useEffect, useState } from 'react';
import './App.css';

const maze = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

const goalPosition = { x: 4, y: 4 };

const App = () => {
  const [ballPosition, setBallPosition] = useState({ x: 1, y: 1 });
  const [hasWon, setHasWon] = useState(false);

  // Initialize device motion
  useEffect(() => {
    const handleMotion = (event) => {
      // Get acceleration including gravity
      const x = event.accelerationIncludingGravity.x;
      const y = event.accelerationIncludingGravity.y;
      
      if (x !== null && y !== null) {
        // Scale down the movement
        moveBall(x * 0.05, y * 0.05);
      }
    };

    // Request permission for iOS 13+ devices
    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        } catch (error) {
          console.error('Error requesting device motion permission:', error);
        }
      } else {
        // Add listener directly for non-iOS devices
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermission();

    // Cleanup
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  const moveBall = (dx, dy) => {
    if (hasWon) return;

    setBallPosition((prevPosition) => {
      const newX = Math.min(Math.max(prevPosition.x + dx, 0), maze[0].length - 1);
      const newY = Math.min(Math.max(prevPosition.y + dy, 0), maze.length - 1);

      // Check for wall collision
      if (maze[Math.round(newY)][Math.round(newX)] === 1) {
        return { x: 1, y: 1 }; // Reset position on collision
      }

      // Check for goal
      if (Math.round(newX) === goalPosition.x && Math.round(newY) === goalPosition.y) {
        setHasWon(true);
        return prevPosition;
      }

      return { x: newX, y: newY };
    });
  };

  return (
    <div className="game-container">
      {hasWon && <div className="toast">You Win!</div>}
      <div className="maze">
        {maze.map((row, rowIndex) => (
          <div key={rowIndex} className="maze-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`maze-cell ${cell === 1 ? 'wall' : ''} ${
                  colIndex === goalPosition.x && rowIndex === goalPosition.y ? 'goal' : ''
                }`}
              />
            ))}
          </div>
        ))}
        <div
          className="ball"
          style={{
            transform: `translate(${ballPosition.x * 50}px, ${ballPosition.y * 50}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
      </div>
    </div>
  );
};

export default App;
