// src/App.js

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

  // Initialize accelerometer
  useEffect(() => {
    if ('Accelerometer' in window) {
      const accelerometer = new Accelerometer({ frequency: 10 });
      accelerometer.addEventListener('reading', () => {
        moveBall(accelerometer.x, accelerometer.y);
      });
      accelerometer.start();
    }
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
                className={`maze-cell ${cell === 1 ? 'wall' : ''} ${colIndex === goalPosition.x && rowIndex === goalPosition.y ? 'goal' : ''}`}
              ></div>
            ))}
          </div>
        ))}
        <motion.div
          className="ball"
          animate={{
            x: ballPosition.x * 50,
            y: ballPosition.y * 50
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
        />
      </div>
    </div>
  );
};

export default App;
