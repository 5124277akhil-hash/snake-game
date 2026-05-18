import MusicPlayer from './components/MusicPlayer';
import SnakeGame from './components/SnakeGame';

export default function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden w-full relative bg-[#050505] font-sans text-cyan-400 text-xl tracking-wider">
      {/* Glitch & Noise Overlays */}
      <div className="bg-noise" />
      <div className="scanlines" />

      {/* Retro-Futurist Terminal Frame */}
      <div className="absolute inset-2 sm:inset-6 border-4 border-fuchsia-500/20 flex flex-col pointer-events-none z-0 mix-blend-screen screen-tear">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 border-cyan-400" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-8 border-r-8 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-8 border-l-8 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-8 border-r-8 border-cyan-400" />
        
        {/* Terminal Text Header */}
        <div className="absolute -top-4 left-10 bg-[#050505] px-2 text-sm sm:text-base font-mono text-fuchsia-500 font-bold tracking-widest uppercase">
          TERM_ID::X78_OP.CORE
        </div>
      </div>

      {/* Main Execution Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-4 pb-32 sm:pb-36 min-h-0 screen-tear">
        <SnakeGame />
      </main>

      {/* Music Player Module */}
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-10 sm:left-10 sm:right-10 z-20 border-4 border-fuchsia-500 bg-[#050505] shadow-[8px_8px_0_theme(colors.cyan.400)]">
        <MusicPlayer />
      </div>
    </div>
  );
}
