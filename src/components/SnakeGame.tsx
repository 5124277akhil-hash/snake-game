import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

const GRID_SIZE = 20;

type Point = { x: number; y: number };
type Difficulty = 'MIN' | 'AVG' | 'MAX';
const SPEED_MAP: Record<Difficulty, number> = { MIN: 120, AVG: 80, MAX: 50 };
const DIFF_MULTS: Record<Difficulty, number> = { MIN: 1, AVG: 2, MAX: 3 };

function randomFood(snake: Point[]): Point {
  let newFood;
  while (true) {
    newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) break;
  }
  return newFood;
}

const INIT_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }];
const INIT_DIR = { x: 0, y: -1 };

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INIT_SNAKE);
  const [dir, setDir] = useState<Point>(INIT_DIR);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [difficulty, setDifficulty] = useState<Difficulty>('AVG');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const lastDir = useRef<Point>(INIT_DIR);
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      setFood(randomFood(INIT_SNAKE));
      isInitialRender.current = false;
    }
  }, []);

  // Global keyblock to prevent scrolling when using arrows
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }

      if (e.key === ' ') {
        setIsPaused(p => !p);
        return;
      }

      if (isPaused) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          setIsPaused(false);
        } else {
          return;
        }
      }

      const lDir = lastDir.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (lDir.y !== 1) setDir({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (lDir.y !== -1) setDir({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (lDir.x !== 1) setDir({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (lDir.x !== -1) setDir({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const move = () => {
      setSnake(prev => {
        const head = prev[0];
        const nextHead = { x: head.x + dir.x, y: head.y + dir.y };

        // Wall Collision
        if (nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE) {
          handleGameOver();
          return prev;
        }

        // Self Collision
        if (prev.some(seg => seg.x === nextHead.x && seg.y === nextHead.y)) {
          handleGameOver();
          return prev;
        }

        const newSnake = [nextHead, ...prev];
        if (nextHead.x === food.x && nextHead.y === food.y) {
          setScore(s => s + 10 * DIFF_MULTS[difficulty]);
          setFood(randomFood(newSnake));
        } else {
          newSnake.pop();
        }

        lastDir.current = dir;
        return newSnake;
      });
    };

    const timer = setTimeout(move, SPEED_MAP[difficulty]);
    return () => clearTimeout(timer);
  }, [snake, dir, gameOver, isPaused, difficulty, food]);

  const handleGameOver = () => {
    setGameOver(true);
    if (score > highScore) setHighScore(score);
  };

  const resetGame = () => {
    setSnake(INIT_SNAKE);
    setDir(INIT_DIR);
    lastDir.current = INIT_DIR;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setFood(randomFood(INIT_SNAKE));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl px-4 select-none uppercase tracking-widest font-sans">
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end w-full mb-6 gap-6 border-b-4 border-fuchsia-500 pb-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-mono font-bold text-cyan-400 glitch-text" data-text="SYS.OVERRIDE//SNAKE">
            SYS.OVERRIDE//SNAKE
          </h1>
          <div className="flex gap-6 mt-3 text-lg sm:text-2xl">
            <p className="text-cyan-600">
              DATA_ACQ: <span className="text-fuchsia-400 font-bold animate-pulse">{score}</span>
            </p>
            <p className="text-cyan-700">
              MAX_EFF: <span className="text-cyan-400 font-bold">{highScore}</span>
            </p>
          </div>
        </div>

        {/* Difficulty Selectors */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-sm font-mono text-fuchsia-500 animate-pulse">:: SET_THREAT_LEVEL ::</span>
          <div className="flex items-center gap-3">
            {(['MIN', 'AVG', 'MAX'] as const).map(level => (
              <button
                key={level}
                onClick={() => {
                  if (!gameOver) setIsPaused(true);
                  setDifficulty(level);
                }}
                className={cn(
                  "px-3 py-1 text-base sm:text-lg font-bold transition-none border-2 outline-none cursor-pointer",
                  difficulty === level
                    ? "bg-cyan-400 text-[#050505] border-cyan-400 shadow-[4px_4px_0_theme(colors.fuchsia.500)]"
                    : "bg-transparent text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/20"
                )}
              >
                [{level}]
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="relative bg-[#050505] p-2 w-full max-w-[500px] aspect-square flex items-center justify-center border-4 border-cyan-400 shadow-[8px_8px_0_theme(colors.fuchsia.500)]">
        {/* Render Grid */}
        <div
          className="grid w-full h-full bg-[#050505] relative overflow-hidden shrink-0 border-2 border-cyan-900/50"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isFood = food.x === x && food.y === y;
            const isSnakeHead = snake[0].x === x && snake[0].y === y;
            const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y);

            return (
              <div key={i} className="w-full h-full border-[1px] border-cyan-900/20 relative">
                {isFood && (
                  <div className="absolute inset-[1px] bg-fuchsia-500 animate-ping opacity-60" />
                )}
                {isFood && (
                  <div className="absolute inset-[2px] bg-fuchsia-400 z-10" />
                )}
                {isSnakeHead && (
                  <div className="absolute inset-[0px] bg-cyan-300 z-20 shadow-[0_0_10px_theme(colors.cyan.400)] scale-110" />
                )}
                {isSnakeBody && (
                  <div className="absolute inset-[2px] bg-cyan-600 opacity-90" />
                )}
              </div>
            );
          })}
        </div>

        {/* System Overlays */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-sm border-8 border-fuchsia-500 shadow-[inset_0_0_50px_rgba(255,0,255,0.4)]">
            <h2 className="text-5xl sm:text-6xl font-mono text-fuchsia-500 mb-6 glitch-text-magenta text-center" data-text="CRITICAL_FAULT">
              CRITICAL<br/>FAULT
            </h2>
            <p className="text-cyan-400 font-sans text-2xl mb-10 text-center">FINAL_DATA:: <span className="text-white font-bold">{score}</span></p>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-fuchsia-500 text-[#050505] border-4 border-fuchsia-500 font-bold hover:bg-[#050505] hover:text-fuchsia-500 transition-colors shadow-[6px_6px_0_theme(colors.cyan.400)] text-2xl sm:text-3xl font-mono uppercase"
            >
              [ RESTART_SEQ ]
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050505]/80 backdrop-blur-md cursor-pointer border-4 border-cyan-400/50" onClick={() => setIsPaused(false)}>
            <p className="text-fuchsia-500 text-3xl sm:text-4xl text-center font-bold tracking-widest font-mono mb-4 animate-pulse">
              [ AWAITING_INPUT ]
            </p>
            <p className="text-cyan-400 text-lg sm:text-xl text-center">
              ::{">"} Press Arrow Keys
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
