import { useState, useRef, useEffect } from 'react';

const TRACKS = [
  { id: 1, title: 'SYS_AUDIO.001 // OVERLOAD', artist: 'NULL_ENTITY', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80' },
  { id: 2, title: 'SYS_AUDIO.002 // GLITCH', artist: 'UNKNOWN_VAR', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=150&q=80' },
  { id: 3, title: 'SYS_AUDIO.003 // PURGE', artist: 'SECTOR_9', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80' },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();

  const track = TRACKS[currentTrackIndex];

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (direction: 1 | -1) => {
    let nextIndex = currentTrackIndex + direction;
    if (nextIndex < 0) nextIndex = TRACKS.length - 1;
    if (nextIndex >= TRACKS.length) nextIndex = 0;
    setCurrentTrackIndex(nextIndex);
    setProgress(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex]);

  const whilePlaying = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(whilePlaying);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(whilePlaying);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  const formatTime = (time: number) => {
    if (time && !isNaN(time)) {
      const minutes = Math.floor(time / 60);
      const formatMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const seconds = Math.floor(time % 60);
      const formatSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
      return `${formatMinutes}:${formatSeconds}`;
    }
    return '00:00';
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-6 select-none font-sans uppercase tracking-widest text-cyan-400 bg-[#050505]">
      <audio
        ref={audioRef}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => handleSkip(1)}
      />

      {/* Digital Track Info */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0 pr-4 border-r-2 border-cyan-400/20">
        <div className="w-16 h-16 bg-fuchsia-900 border-2 border-fuchsia-500 relative group flex-shrink-0">
          <img src={track.cover} alt="Cover" className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
          <div className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay pointer-events-none" />
          <div className="absolute bottom-0 right-0 bg-fuchsia-500 text-[#050505] text-[10px] px-1 font-bold z-10">TRK.{currentTrackIndex+1}</div>
        </div>
        <div className="flex flex-col truncate flex-1">
          <h3 className="font-mono text-fuchsia-400 font-bold truncate text-lg sm:text-xl animate-pulse">{track.title}</h3>
          <p className="text-sm sm:text-base text-cyan-600 truncate mt-1">ID:: {track.artist}</p>
        </div>
      </div>

      {/* Terminal Playback Controls */}
      <div className="flex flex-col items-center flex-1 max-w-2xl px-2">
        <div className="flex items-center gap-6 sm:gap-10 mb-3 font-mono text-xl sm:text-2xl font-bold text-fuchsia-500">
          <button onClick={() => handleSkip(-1)} className="hover:text-cyan-400 hover:bg-cyan-400/10 px-2 transition-colors active:scale-95">{"[ < ]"}</button>
          
          <button
            onClick={togglePlay}
            className="text-2xl sm:text-3xl text-cyan-400 hover:text-[#050505] hover:bg-cyan-400 px-6 py-1 border-2 border-cyan-400 transition-all shadow-[4px_4px_0_theme(colors.fuchsia.500)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            {isPlaying ? '[ PAUSE ]' : '[ EXEC ]'}
          </button>
          
          <button onClick={() => handleSkip(1)} className="hover:text-cyan-400 hover:bg-cyan-400/10 px-2 transition-colors active:scale-95">{"[ > ]"}</button>
        </div>
        
        {/* Progress Display */}
        <div className="w-full flex items-center gap-4 text-base text-fuchsia-500/80 font-bold">
          <span className="w-16 text-right shrink-0">T-{formatTime(progress)}</span>
          <div className="flex-1 hidden sm:block relative cursor-pointer pt-2 pb-2 group" onClick={(e) => {
             if(!audioRef.current) return;
             const rect = e.currentTarget.getBoundingClientRect();
             const pct = (e.clientX - rect.left) / rect.width;
             const newTime = pct * duration;
             audioRef.current.currentTime = newTime;
             setProgress(newTime);
          }}>
             <div className="h-3 bg-[#0a0a0a] border-2 border-cyan-400/30 w-full relative">
                <div 
                   className="absolute top-0 left-0 h-full bg-fuchsia-500 border-r-4 border-cyan-400"
                   style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                />
             </div>
             <input
              type="range"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={handleProgressChange}
             />
          </div>
          <span className="hidden sm:inline w-16 shrink-0">T-{formatTime(duration)}</span>
        </div>
      </div>

      {/* Aux Controls */}
      <div className="flex-1 flex justify-end items-center gap-4 hidden md:flex min-w-0 pl-4 border-l-2 border-cyan-400/20">
         <button 
           onClick={toggleMute} 
           className="font-mono text-base font-bold border-2 border-fuchsia-500 px-4 py-2 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-[#050505] transition-colors shadow-[4px_4px_0_theme(colors.cyan.400)] active:translate-x-1 active:translate-y-1 active:shadow-none"
         >
           {isMuted ? '[ AUDIO_OFF ]' : '[ AUDIO_ON  ]'}
         </button>
      </div>
    </div>
  );
}
