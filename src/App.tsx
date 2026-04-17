/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 12 },
  { x: 10, y: 11 },
  { x: 10, y: 10 },
  { x: 9, y: 10 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

const generateFood = (snake: {x: number, y: number}[]) => {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      break;
    }
  }
  return newFood;
};

export default function App() {
  const [snake, setSnake] = useState<{x: number, y: number}[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 14, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const directionRef = useRef(direction);
  const [glitchTrigger, setGlitchTrigger] = useState(false);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (gameOver) resetGame();
        return;
      }

      if (gameOver) return;

      const dir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (dir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (dir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (dir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (dir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    
    // Random system instability effect
    const gInterval = setInterval(() => {
       if(Math.random() > 0.85) {
           setGlitchTrigger(true);
           setTimeout(() => setGlitchTrigger(false), 150);
       }
    }, 2000);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearInterval(gInterval);
    };
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          handleGameOver();
          return prevSnake;
        }

        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 16);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, 150 - Math.floor(score / 64) * 15);
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [food, gameOver, score]);

  const handleGameOver = () => {
    setGameOver(true);
    setHighScore((prev) => Math.max(prev, score));
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-glitch-bg text-white font-pixel uppercase selection:bg-magenta selection:text-cyan relative overflow-hidden ${glitchTrigger ? 'translate-x-1 -translate-y-1' : ''}`}>
      <div className="static-noise"></div>
      <div className="scanlines"></div>

      <div className="mb-8 text-center z-10 w-full px-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 glitch-text" data-text="OVR_RIDE_SYS">OVR_RIDE_SYS</h1>
        <div className="flex justify-center space-x-8 md:space-x-16 text-[10px] md:text-xs tracking-widest text-cyan">
          <p>MEM_LEAK: <span className="text-magenta">{score}</span> B</p>
          <p>MAX_CORRUPT: <span className="text-white">{highScore}</span> B</p>
        </div>
      </div>

      <div className={`relative z-10 p-1 border-t-4 border-l-4 border-magenta border-b-4 border-r-4 border-cyan ${glitchTrigger ? 'opacity-80 scale-[1.01]' : 'opacity-100'} transition-transform duration-75`}>
        <div 
          className="w-[320px] md:w-[450px] aspect-square grid bg-[#050505] overflow-hidden relative"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, 
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
          }}
        >
          {snake.map((segment, i) => (
            <div 
              key={i}
              className={`rounded-none ${i === 0 ? 'bg-cyan z-10' : 'bg-magenta opacity-80'}`}
              style={{ gridColumnStart: segment.x + 1, gridRowStart: segment.y + 1, marginLeft: '1px', marginTop: '1px' }}
            ></div>
          ))}
          
          <div 
            className="bg-white z-10 scale-[0.65] animate-glitch object-food"
            style={{ 
                gridColumnStart: food.x + 1, 
                gridRowStart: food.y + 1,
                boxShadow: "2px 2px 0px var(--color-magenta), -2px -2px 0px var(--color-cyan)"
            }}
           ></div>
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-[#000000]/90 flex flex-col items-center justify-center z-20 border-2 border-magenta">
             <h2 className="text-xl md:text-3xl font-bold text-magenta mb-6 tracking-widest glitch-text text-center leading-loose" data-text="SYS.HALT">SYS.HALT</h2>
             <p className="text-cyan mb-10 font-pixel text-[8px] md:text-[10px] animate-pulse">EXCEPTION AT 0x{score.toString(16).toUpperCase()}</p>
             <button 
               onClick={resetGame}
               className="px-6 py-4 bg-transparent text-white border-2 border-magenta font-bold hover:bg-magenta hover:text-black transition-colors uppercase tracking-widest cursor-pointer text-[10px] md:text-xs shadow-[4px_4px_0_var(--color-cyan)] hover:shadow-[0_0_0_var(--color-cyan)] hover:translate-x-[4px] hover:translate-y-[4px]"
             >
               REBOOT_T
             </button>
          </div>
        )}
      </div>

      <div className={`mt-10 text-[8px] md:text-[10px] text-cyan/70 text-center space-y-4 z-10 max-w-sm px-4 leading-loose ${glitchTrigger ? 'opacity-50' : 'opacity-100'}`}>
        <p>I/O VECTOR: [AWSD_KEYS]</p>
        <p className="text-magenta/70">INTERRUPT_CALL: [SPACE]</p>
      </div>
    </div>
  );
}
