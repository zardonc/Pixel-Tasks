import React, { useState } from 'react';
import { useStore } from '../store';
import { PixelCard, PixelButton } from '../components/ui/PixelComponents';
import { Trophy, Lock, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const Achievements: React.FC = () => {
  const { achievements, claimAchievement } = useStore();
  const [toastReward, setToastReward] = useState<number | null>(null);

  const handleClaim = async (id: string, reward: number) => {
      try {
          await claimAchievement(id);
          setToastReward(reward);
          
          // Auto hide toast after 2.5 seconds
          setTimeout(() => {
              setToastReward(null);
          }, 2500);
      } catch (e) {
          console.error("Claim failed", e);
      }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
          {toastReward && (
              <motion.div 
                initial={{ opacity: 0, y: -50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="fixed top-24 left-1/2 bg-yellow-400 border-4 border-black shadow-[4px_4px_0_0_#000] px-8 py-4 z-50 flex flex-col items-center min-w-[300px]"
              >
                  <h3 className="text-3xl font-bold animate-bounce uppercase">Level Up!</h3>
                  <p className="text-xl font-bold">
                      +<span className="text-white bg-black px-2 mx-1">{toastReward}</span> XP Added to wallet
                  </p>
              </motion.div>
          )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
            <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-widest mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>Hall of Fame</h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400">Track your legacy, Adventurer!</p>
        </div>
        
        <div className="bg-yellow-50 dark:bg-card-dark border-2 border-black dark:border-white shadow-pixel p-4 min-w-[300px]">
             <div className="grid grid-cols-3 divide-x-2 divide-black dark:divide-white text-center">
                 <div className="px-4">
                     <div className="text-gray-500 text-lg uppercase">Total XP</div>
                     <div className="text-3xl font-bold text-orange-500">12k</div>
                 </div>
                 <div className="px-4">
                     <div className="text-gray-500 text-lg uppercase">Badges</div>
                     <div className="text-3xl font-bold text-blue-500">8<span className="text-gray-400 text-xl">/24</span></div>
                 </div>
                 <div className="px-4">
                     <div className="text-gray-500 text-lg uppercase">Comp</div>
                     <div className="text-3xl font-bold text-green-500">33%</div>
                 </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {achievements.map((ach) => (
           <PixelCard 
             key={ach.id} 
             className={`
                flex flex-col justify-between transition-all duration-300
                ${ach.status === 'LOCKED' ? 'opacity-70 bg-gray-100 dark:bg-gray-800' : ''}
                ${ach.status === 'CLAIMABLE' ? 'border-4 border-yellow-400 transform hover:-translate-y-1' : ''}
             `}
           >
              {ach.status === 'CLAIMABLE' && (
                  <div className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 flex items-center justify-center border-2 border-black z-10 font-bold text-xl animate-bounce">!</div>
              )}

              <div className="flex items-start gap-4 mb-4">
                 <div className={`
                    w-16 h-16 border-2 border-black flex items-center justify-center text-3xl shrink-0
                    ${ach.status === 'LOCKED' ? 'bg-gray-300' : 'bg-blue-100'}
                 `}>
                    {ach.status === 'LOCKED' ? <Lock /> : <Trophy className="text-yellow-600" />}
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold uppercase leading-none mb-1">{ach.title}</h3>
                    <p className="text-lg text-gray-500 leading-tight">{ach.status === 'LOCKED' ? '???' : ach.description}</p>
                 </div>
              </div>

              <div>
                  <div className="flex justify-between text-lg font-bold mb-1 uppercase">
                      <span>Progress</span>
                      <span>{ach.progress} / {ach.maxProgress}</span>
                  </div>
                  <div className="w-full h-6 border-2 border-black bg-white relative">
                      <div 
                        className="h-full bg-green-400 border-r-2 border-black transition-all duration-500" 
                        style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                      ></div>
                  </div>
                  
                  {ach.status === 'CLAIMABLE' && (
                      <PixelButton 
                        fullWidth 
                        className="mt-4" 
                        variant="primary"
                        onClick={() => handleClaim(ach.id, ach.reward)}
                      >
                         <Zap size={18} /> CLAIM {ach.reward} XP
                      </PixelButton>
                  )}
                  {ach.status === 'COMPLETED' && (
                      <div className="mt-4 text-center p-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent text-green-600 dark:text-green-400 font-bold uppercase flex items-center justify-center gap-2">
                          <CheckIcon /> Completed
                      </div>
                  )}
              </div>
           </PixelCard>
        ))}
      </div>
    </div>
  );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
)
