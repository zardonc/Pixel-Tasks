import React, { useState } from 'react';
import { GameStatus } from './types';
import { Trophy, RotateCcw, Menu, X, ArrowLeft, Volume2, Camera } from 'lucide-react';

interface GameOverlayProps {
    score: number;
    bestScore: number;
    status: GameStatus;
    soundEnabled: boolean;
    is3D: boolean;
    onToggleSound: () => void;
    onToggle3D: () => void;
    onRestart: () => void;
    onQuit: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ score, bestScore, status, soundEnabled, is3D, onToggleSound, onToggle3D, onRestart, onQuit }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">
            {/* Top Header */}
            <div className="flex justify-between items-start pointer-events-auto w-full">
                <div className="flex gap-2">
                    <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-col items-center justify-center min-w-[4.5rem]">
                        <div className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-0.5">Score</div>
                        <div className="text-xl font-bold text-white leading-none">{score}</div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-col items-center justify-center min-w-[4.5rem]">
                        <div className="text-[10px] text-amber-500/70 uppercase font-bold tracking-widest mb-0.5">Best</div>
                        <div className="text-xl font-bold text-amber-400 leading-none">{bestScore}</div>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button onClick={onRestart} className="p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-black/80 transition-all active:scale-95 group">
                        <RotateCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-300" />
                    </button>
                    <button onClick={() => setIsMenuOpen(true)} className="p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-black/80 transition-all active:scale-95">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Menu Drawer Modal */}
            {isMenuOpen && (
                <div className="absolute inset-0 z-50 pointer-events-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Menu className="w-5 h-5 text-amber-400" /> Options
                            </h2>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-white/50 hover:text-white rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                            <button onClick={() => { onRestart(); setIsMenuOpen(false); }} className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 flex items-center gap-3 text-white font-medium transition-colors">
                                <RotateCcw className="w-5 h-5 text-emerald-400" /> New Game
                            </button>
                            <button onClick={onToggleSound} className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 flex items-center justify-between text-white font-medium transition-colors">
                                <div className="flex items-center gap-3"><Volume2 className={`w-5 h-5 ${soundEnabled ? 'text-blue-400' : 'text-slate-500'}`} /> FX Sound</div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${soundEnabled ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-500/20 text-slate-400'}`}>
                                    {soundEnabled ? 'ON' : 'OFF'}
                                </span>
                            </button>
                            <button onClick={onToggle3D} className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 flex items-center justify-between text-white font-medium transition-colors">
                                <div className="flex items-center gap-3"><Camera className="w-5 h-5 text-purple-400" /> Camera Angle</div>
                                <span className={`text-xs font-bold px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md`}>
                                    {is3D ? '3D' : 'TOP-DOWN'}
                                </span>
                            </button>
                            <div className="h-px bg-white/5 my-2" />
                            <button onClick={onQuit} className="w-full p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-3 text-red-400 font-bold transition-colors">
                                <ArrowLeft className="w-5 h-5" /> Quit to Hub
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over / Victory Screen */}
            {status !== 'PLAYING' && !isMenuOpen && (
                <div className="absolute inset-0 z-40 pointer-events-auto bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="text-center mb-8">
                        {status === 'WON' ? (
                            <>
                                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
                                <h1 className="text-5xl font-black text-white tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 drop-shadow-lg">You Win!</h1>
                            </>
                        ) : (
                            <h1 className="text-5xl font-black text-white tracking-widest uppercase opacity-80">Game Over</h1>
                        )}
                        <p className="text-slate-300 mt-4 text-lg">Final Score: <span className="text-white font-bold">{score}</span></p>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <button onClick={onRestart} className="w-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-lg py-4 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                            Play Again
                        </button>
                        <button onClick={onQuit} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium py-4 rounded-xl transition-all active:scale-95">
                            Back to Hub
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
