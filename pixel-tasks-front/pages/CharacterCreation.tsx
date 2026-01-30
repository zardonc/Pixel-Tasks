import React, { useState } from 'react';
import { useStore } from '../store';
import { PixelButton, PixelCard, PixelInput } from '../components/ui/PixelComponents';
import { CompanionType } from '../types';
import { motion } from 'framer-motion';

export const CharacterCreation: React.FC = () => {
  const login = useStore(state => state.login);
  // Default to Login mode (true) instead of Creation mode (false)
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companion, setCompanion] = useState<CompanionType>(CompanionType.DOG);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      if (email && password) {
        // Mock login with default data since we don't have a real backend
        login('Returned Hero', email, CompanionType.DOG);
      }
    } else {
      if (name && email && password) {
        login(name, email, companion);
      }
    }
  };

  // Pixel Cloud SVG
  const PixelCloud = ({ className }: { className?: string }) => (
    <svg 
      viewBox="0 0 64 32" 
      className={className} 
      style={{ imageRendering: 'pixelated' }} 
      fill="white" 
      xmlns="http://www.w3.org/2000/svg"
    >
        {/* Blocky cloud shape */}
        <path d="M12 20 h-8 v-8 h8 v-4 h8 v-4 h20 v4 h12 v4 h8 v12 h-48 Z" fill="white" />
        <path d="M12 20 h-8 v-8 h8 v-4 h8 v-4 h20 v4 h12 v4 h8 v12 h-48 Z" fill="rgba(0,0,0,0.05)" transform="translate(4,4)" />
    </svg>
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#63b4ff]">
      
      {/* --- Sky Layer --- */}
      <div className="absolute inset-0 z-0">
          {/* Stars/Sparkles */}
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-10 left-10 text-white text-2xl">✦</motion.div>
          <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="absolute top-24 right-24 text-white text-xl">✨</motion.div>
          <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} className="absolute top-40 left-1/4 text-white text-lg">✦</motion.div>
          
          {/* Drifting Clouds */}
          <motion.div 
            initial={{ x: '-20%' }} 
            animate={{ x: '120%' }} 
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            className="absolute top-12 w-48 opacity-90"
          >
             <PixelCloud className="w-full drop-shadow-md" />
          </motion.div>
          
          <motion.div 
            initial={{ x: '-20%' }} 
            animate={{ x: '120%' }} 
            transition={{ duration: 60, repeat: Infinity, ease: 'linear', delay: 20 }}
            className="absolute top-32 w-32 opacity-80"
          >
             <PixelCloud className="w-full drop-shadow-sm" />
          </motion.div>

          <motion.div 
            initial={{ x: '-20%' }} 
            animate={{ x: '120%' }} 
            transition={{ duration: 35, repeat: Infinity, ease: 'linear', delay: 10 }}
            className="absolute top-8 right-0 w-24 opacity-70"
          >
             <PixelCloud className="w-full" />
          </motion.div>
      </div>

      {/* --- Landscape Layer --- */}
      
      {/* Far Hills */}
      <div className="absolute bottom-[100px] w-full flex items-end z-0 pointer-events-none opacity-90">
           {/* CSS Triangles for mountains */}
           <div className="w-0 h-0 border-l-[15vw] border-l-transparent border-r-[15vw] border-r-transparent border-b-[20vh] border-b-[#86efac] -ml-[5vw]"></div>
           <div className="w-0 h-0 border-l-[20vw] border-l-transparent border-r-[20vw] border-r-transparent border-b-[30vh] border-b-[#4ade80] -ml-[10vw]"></div>
           <div className="w-0 h-0 border-l-[25vw] border-l-transparent border-r-[25vw] border-r-transparent border-b-[25vh] border-b-[#22c55e] ml-auto -mr-[5vw]"></div>
      </div>

      {/* Pasture Ground */}
      <div className="absolute bottom-0 w-full h-[120px] bg-[#4ade80] border-t-8 border-[#16a34a] z-0 shadow-lg">
          {/* Pattern */}
          <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
      </div>

      {/* Trees & Decor */}
      <div className="absolute bottom-[100px] w-full flex justify-between px-4 z-0 pointer-events-none">
          {/* Left Trees */}
          <div className="flex items-end -space-x-8">
             <PixelTree scale={1.2} />
             <PixelTree color="#15803d" />
             <PixelTree scale={0.8} color="#14532d" />
          </div>
          
          {/* Right Trees */}
          <div className="flex items-end -space-x-6">
             <PixelTree color="#15803d" scale={0.9} />
             <PixelTree scale={1.1} />
          </div>
      </div>

      {/* --- Main Login Card --- */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
        className="z-10 w-full max-w-sm"
      >
        <PixelCard className="bg-white/95 backdrop-blur-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)]">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold uppercase mb-1 tracking-wide text-black font-pixel">Pixel Tasks</h1>
            <p className="text-gray-500 font-pixel text-lg">
              {isLoginMode ? 'Welcome back, Adventurer!' : 'Start your collection journey.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Companion Selection - Only in Sign Up */}
            {!isLoginMode && (
              <div className="flex justify-center gap-4 mb-4">
                 {[
                   { type: CompanionType.DOG, emoji: '🐶', label: 'Dog' },
                   { type: CompanionType.CAT, emoji: '🐱', label: 'Cat' }
                 ].map((opt) => (
                   <div 
                      key={opt.type}
                      onClick={() => setCompanion(opt.type)}
                      className={`
                        cursor-pointer w-24 h-24 flex flex-col items-center justify-center rounded-lg border-3 transition-all
                        ${companion === opt.type 
                          ? 'bg-yellow-50 border-primary shadow-pixel-sm scale-105' 
                          : 'bg-white border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                        }
                      `}
                   >
                      <div className="text-4xl mb-1">{opt.emoji}</div>
                      <span className="text-xs font-bold uppercase text-gray-600">{opt.label}</span>
                   </div>
                 ))}
              </div>
            )}

            <div className="space-y-3">
               {!isLoginMode && (
                 <PixelInput 
                   label="Hero Name"
                   required
                   placeholder="e.g. Ash Ketchum"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="bg-gray-50 focus:bg-white"
                 />
               )}
               
               <PixelInput 
                 label="Email"
                 type="email" 
                 required
                 placeholder="hero@example.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="bg-gray-50 focus:bg-white"
               />

               <PixelInput 
                 label="Password"
                 type="password" 
                 required
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="bg-gray-50 focus:bg-white"
               />
            </div>

            <PixelButton type="submit" fullWidth className="mt-4 py-3 text-xl bg-primary hover:bg-yellow-400 border-black text-black shadow-pixel hover:shadow-pixel-sm transition-transform hover:-translate-y-1">
              {isLoginMode ? 'Resume Adventure' : 'Start Adventure'}
            </PixelButton>
          </form>
          
          <div className="mt-6 text-center">
             <span className="text-gray-600 font-bold font-pixel text-lg block sm:inline mb-1 sm:mb-0 mr-1">
                {isLoginMode ? "New here?" : "Already have a save file?"}
             </span>
             <button 
                type="button" 
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-primary hover:text-yellow-600 font-bold uppercase tracking-wide underline decoration-2 underline-offset-4"
             >
                {isLoginMode ? "CREATE CHARACTER" : "LOG IN"}
             </button>
          </div>
        </PixelCard>
      </motion.div>
    </div>
  );
};

// Simple Pixel Tree Component using CSS borders
const PixelTree = ({ color = '#16a34a', scale = 1 }) => (
    <div className="relative flex flex-col items-center" style={{ transform: `scale(${scale})` }}>
        {/* Leaves */}
        <div 
          className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[50px] relative z-20 drop-shadow-sm"
          style={{ borderBottomColor: color }}
        ></div>
        <div 
          className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[60px] -mt-8 relative z-10 drop-shadow-sm"
          style={{ borderBottomColor: color }}
        ></div>
        {/* Trunk */}
        <div className="w-4 h-8 bg-[#78350f] border-2 border-[#451a03] -mt-2"></div>
    </div>
);
