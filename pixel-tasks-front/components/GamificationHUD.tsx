import React from 'react';
import { useStore } from '../store';
import { motion } from 'framer-motion';

export const GamificationHUD: React.FC = () => {
    const { user } = useStore();

    if (!user) return null;

    // Leveling Logic (Matches Backend: XP / 100 + 1)
    // 0-99 = Level 1
    // 100-199 = Level 2
    const currentLevel = user.level;
    const currentXP = user.points;
    const xpForNextLevel = currentLevel * 100; // Linear scaling for now (100, 200, 300...)
    // Actually backend logic is Math.floor(totalXP / 100) + 1.
    // So for Level 1 (0-99 XP), next level is at 100.
    // For Level 2 (100-199 XP), next level is at 200.
    
    // Progress within current level
    const progressXP = currentXP % 100;
    const percentage = Math.min(100, Math.max(0, progressXP));

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col items-end pointer-events-none">
            {/* Level Badge */}
            <div className="bg-yellow-400 border-4 border-black text-black px-4 py-2 font-bold text-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center gap-2 mb-2 pointer-events-auto transform hover:scale-110 transition-transform">
                <span>LVL {currentLevel}</span>
                <span className="text-sm opacity-75">HERO</span>
            </div>

            {/* XP Bar Container */}
            <div className="bg-gray-800 border-4 border-white w-64 h-8 relative shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] pointer-events-auto">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')]"></div>
                
                {/* Fill Bar */}
                <motion.div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 border-r-4 border-white relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 10 }}
                >
                     {/* Glint Effect */}
                     <div className="absolute top-0 right-0 w-1 h-full bg-white opacity-50"></div>
                </motion.div>

                {/* Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs tracking-widest drop-shadow-md">
                    {progressXP} / 100 XP
                </div>
            </div>
        </div>
    );
};
