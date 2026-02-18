import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { PixelCard, PixelButton } from '../components/ui/PixelComponents';
import { Gamepad2, Grid3X3, Bomb, Trophy, Pause } from 'lucide-react';

export const GameHub: React.FC = () => {
  const { games, fetchGames } = useStore();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleQuit = () => {
      setIsPaused(false);
      setActiveGame(null);
  };

  const handleRestart = () => {
      // In a real app, this would reset the game state
      setIsPaused(false);
  };

  if (activeGame) {
      const gameInfo = games.find(g => g.id === activeGame);
      
      // Immersive Game Container
      return (
          <div className="fixed inset-0 z-50 bg-[#222] flex flex-col font-pixel text-white">
              {/* 1. Game HUD (Top Bar) */}
              <header className="h-16 border-b-2 border-white/20 bg-black flex justify-between items-center px-4 z-20 shrink-0">
                 {/* Left: Pause Button */}
                 <button 
                    onClick={() => setIsPaused(true)} 
                    className="flex items-center gap-2 hover:text-yellow-400 transition-colors group"
                 >
                     <div className="border-2 border-current p-1 rounded group-active:translate-y-0.5">
                         <Pause className="w-5 h-5" />
                     </div>
                     <span className="text-xl hidden md:inline">PAUSE</span>
                 </button>

                 {/* Center: Game Title */}
                 <div className="text-3xl font-bold tracking-widest text-yellow-400 uppercase">
                    {gameInfo?.name || 'Game'}
                 </div>

                 {/* Right: Score */}
                 <div className="flex flex-col items-end leading-none">
                     <span className="text-xs text-gray-400 uppercase">SCORE</span>
                     <span className="text-2xl font-bold">1,240</span>
                 </div>
              </header>

              {/* 2. Game Main Area */}
              <main className="flex-1 flex items-center justify-center bg-[#1a1a1a] p-4 relative z-10">
                   {/* Game Canvas Container */}
                   <div className="aspect-square w-full max-w-md max-h-[80vh] border-4 border-black shadow-[0_0_0_4px_white] rounded-lg flex items-center justify-center bg-[#f0f4f8] relative overflow-hidden">
                       
                       {/* Retro Grid Background Pattern */}
                       <div 
                           className="absolute inset-0 opacity-20 pointer-events-none" 
                           style={{ 
                               backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', 
                               backgroundSize: '20px 20px',
                               backgroundPosition: '0 0'
                           }}
                       ></div>

                       {/* Mock Game Content */}
                       <div className="text-center text-black relative z-10">
                           <p className="text-2xl mb-4 opacity-50 font-bold uppercase">Game Area</p>
                           <div className="grid grid-cols-2 gap-4">
                               <div className="w-24 h-24 border-4 border-black bg-white flex items-center justify-center text-4xl font-bold shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                                   ?
                               </div>
                               <div className="w-24 h-24 border-4 border-black bg-yellow-400 flex items-center justify-center text-4xl font-bold shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                                   !
                               </div>
                           </div>
                           <p className="mt-8 text-sm font-bold animate-pulse">PRESS START</p>
                       </div>
                   </div>
              </main>

              {/* 3. Pause Menu Overlay */}
              {isPaused && (
                  <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <div className="w-80 bg-black border-4 border-white p-6 text-center shadow-[10px_10px_0_0_rgba(255,255,255,0.2)] animate-in zoom-in-95 duration-200">
                        <h2 className="text-4xl font-bold text-yellow-400 mb-2 animate-pulse">PAUSED</h2>
                        <p className="text-gray-400 mb-8 text-lg">Don't give up now!</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => setIsPaused(false)}
                                className="w-full border-2 border-white bg-white text-black py-3 text-2xl font-bold hover:bg-gray-200 transition-all active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                RESUME GAME
                            </button>

                            <button
                                onClick={handleRestart}
                                className="w-full border-2 border-white bg-black text-white py-3 text-2xl font-bold hover:bg-gray-900 transition-all active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                RESTART
                            </button>

                            <button
                                onClick={handleQuit}
                                className="w-full border-2 border-red-600 bg-red-600 text-white py-3 text-2xl font-bold hover:bg-red-700 mt-8 transition-all active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                QUIT TO HUB
                            </button>
                        </div>
                    </div>
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="mb-12 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 uppercase">Arcade Center</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Take a break. Earn XP. Have fun.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard label="Tasks Done" value="12/15" icon={<Grid3X3 />} color="text-green-500" />
            <StatCard label="High Score" value="24,500" icon={<Trophy />} color="text-yellow-500" />
            <StatCard label="Streak" value="5 Days" icon={<Bomb />} color="text-red-500" />
        </div>

        <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4 uppercase">Available Games</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map(game => (
                <div 
                    key={game.id}
                    className="group relative bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-pixel hover:shadow-pixel-lg hover:-translate-y-2 transition-all cursor-pointer overflow-hidden"
                    onClick={() => setActiveGame(game.id)}
                >
                    <div className={`h-40 ${game.color} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-dither opacity-10"></div>
                        <Gamepad2 size={64} className="text-white drop-shadow-md transform group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-bold uppercase">{game.name}</h3>
                            <span className="bg-black text-white text-xs px-2 py-1 uppercase font-bold">{game.tag}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">{game.description}</p>
                        <PixelButton fullWidth className="text-sm">Play Now</PixelButton>
                    </div>
                </div>
            ))}
            
            {/* Locked Game */}
            <div className="bg-gray-100 dark:bg-gray-800 border-4 border-dashed border-gray-400 p-6 flex flex-col items-center justify-center opacity-70">
                 <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                     <span className="material-icons text-4xl text-gray-400">lock</span>
                 </div>
                 <h3 className="text-2xl font-bold uppercase text-gray-500">Coming Soon</h3>
            </div>
        </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
    <div className="bg-card-light dark:bg-card-dark p-6 border-2 border-black dark:border-gray-600 shadow-pixel flex justify-between items-center">
        <div>
            <p className="text-gray-500 uppercase text-sm font-bold">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 bg-gray-100 dark:bg-gray-900 rounded border-2 border-transparent ${color}`}>
            {icon}
        </div>
    </div>
);
