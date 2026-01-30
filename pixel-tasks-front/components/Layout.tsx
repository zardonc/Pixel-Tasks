import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { CheckSquare, Gamepad2, ShoppingBag, Trophy, Menu, Plus, Settings, Sun, Moon, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onAddTask: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onAddTask }) => {
  const { user, isDarkMode, toggleDarkMode, logout } = useStore();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Don't show layout on Login
  if (!user) return <>{children}</>;

  // Don't show layout on immersive game mode
  if (location.pathname.includes('/game-play')) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark relative overflow-x-hidden transition-colors duration-200">
      
      {/* 1. Companion Trigger (Menu Button) - Top Left */}
      <div 
        onClick={() => setSidebarOpen(true)}
        className="fixed top-6 left-6 z-50 cursor-pointer group"
      >
        {/* Speech Bubble Tooltip */}
        <div className="absolute -top-10 left-8 opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100 origin-bottom-left pointer-events-none">
            <div className="bg-white border-2 border-black px-3 py-1 whitespace-nowrap shadow-[2px_2px_0_0_#000]">
                <span className="text-lg font-bold uppercase text-black">Open Menu!</span>
                {/* Tail */}
                <div className="absolute -bottom-2 left-2 w-3 h-3 bg-white border-r-2 border-b-2 border-black transform rotate-45"></div>
            </div>
        </div>

        <div className="relative">
            {/* Avatar Circle */}
            <div className="w-16 h-16 bg-white dark:bg-card-dark rounded-full border-3 border-black dark:border-white flex items-center justify-center shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.5)] transition-transform group-hover:-translate-y-1">
                <span className="text-4xl filter drop-shadow-sm select-none">
                    {user.companion === 'DOG' ? '🐶' : '🐱'}
                </span>
            </div>
            {/* Menu Badge */}
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white border-2 border-black p-1 rounded-full z-20">
                <Menu size={16} strokeWidth={3} />
            </div>
        </div>
      </div>

      {/* 2. XP Display - Top Right (Moved from Sidebar) */}
      <div className="fixed top-6 right-6 z-40">
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-3 border-black dark:border-white px-4 py-2 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.5)] flex items-center gap-3 transform hover:scale-105 transition-transform cursor-default">
            <span className="text-primary text-2xl animate-pulse">⚡</span>
            <div>
                <span className="font-bold text-2xl block leading-none">{user.xp} XP</span>
                <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Level {user.level}</span>
            </div>
        </div>
      </div>

      {/* 3. Backdrop (Blur) */}
      <div 
        onClick={() => setSidebarOpen(false)}
        className={`
            fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300
            ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* 4. Sidebar Drawer */}
      <aside 
        className={`
            fixed top-0 left-0 h-full w-80 bg-white dark:bg-card-dark border-r-4 border-black dark:border-white z-50 
            flex flex-col pt-28 px-6 pb-6 shadow-[10px_0_20px_rgba(0,0,0,0.2)]
            transform transition-transform duration-300 ease-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
         {/* Drawer Header */}
         <div className="mb-8 border-b-2 border-black dark:border-white pb-4 border-dashed">
            <h2 className="text-4xl font-bold tracking-wider uppercase">Menu</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xl">Where to next, Boss?</p>
         </div>

         {/* Navigation */}
         <nav className="flex-1 space-y-2">
            <DrawerItem to="/" icon={<CheckSquare size={24}/>} label="Dashboard" onClick={() => setSidebarOpen(false)} />
            <DrawerItem to="/gamehub" icon={<Gamepad2 size={24}/>} label="Game Hub" onClick={() => setSidebarOpen(false)} />
            <DrawerItem to="/shop" icon={<ShoppingBag size={24}/>} label="Item Shop" onClick={() => setSidebarOpen(false)} />
            <DrawerItem to="/achievements" icon={<Trophy size={24}/>} label="Hall of Fame" onClick={() => setSidebarOpen(false)} />
         </nav>

         {/* Bottom Actions */}
         <div className="mt-auto pt-6 border-t-2 border-black dark:border-white border-dashed space-y-4">
             {/* Dark Mode Toggle */}
            <button 
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-4 text-2xl font-bold py-2 text-gray-600 dark:text-gray-300 hover:pl-6 transition-all duration-200"
            >
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Logout Button */}
            <button 
                onClick={() => {
                    setSidebarOpen(false);
                    logout();
                }}
                className="w-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 border-3 border-black dark:border-white py-3 text-xl font-bold text-red-600 dark:text-red-400 shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase"
            >
                <LogOut size={20} />
                Log Out
            </button>
         </div>
      </aside>

      {/* 5. Main Content */}
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-24">
         {children}

         {/* Floating Add Task Button (Desktop & Mobile) */}
         <div className="fixed bottom-8 right-8 z-30">
            <button 
                onClick={onAddTask}
                className="w-16 h-16 bg-primary text-black border-3 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:shadow-none active:translate-y-1 transition-all group"
            >
                <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300"/>
            </button>
        </div>
      </main>

    </div>
  );
};

const DrawerItem = ({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick: () => void }) => (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => `
          flex items-center gap-4 text-2xl font-bold py-3 px-2 transition-all duration-200 group rounded
          ${isActive 
             ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white pl-6 border-l-4 border-black dark:border-white' 
             : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:pl-6'
          }
      `}
    >
        <span className="group-hover:scale-110 transition-transform">{icon}</span>
        <span className="uppercase">{label}</span>
    </NavLink>
);
