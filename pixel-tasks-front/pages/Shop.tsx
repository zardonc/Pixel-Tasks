import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { PixelCard, PixelButton } from '../components/ui/PixelComponents';
import { ThemePreview } from '../components/ui/ThemePreview';
import { THEME_CONFIGS } from '../utils/themes';
import { ShoppingBag, Check } from 'lucide-react';

export const Shop: React.FC = () => {
  const { user, shopItems, buyItem, equipItem, fetchShopItems } = useStore();
  const [showOwned, setShowOwned] = useState(false);
  const [activeTab, setActiveTab] = useState<'FRAME' | 'THEME'>('FRAME');

  useEffect(() => {
    fetchShopItems();
  }, [fetchShopItems]);

  const filteredItems = shopItems.filter(i => {
      const matchOwned = showOwned ? i.owned : true;
      const matchTab = i.type === activeTab;
      return matchOwned && matchTab;
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold uppercase">Pixel Store</h1>
                <p className="text-gray-600 dark:text-gray-400">Spend your hard-earned XP!</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white px-6 py-3 shadow-pixel flex items-center gap-3">
                <span className="material-icons text-primary text-3xl">monetization_on</span>
                <span className="text-3xl font-bold">{user?.points || 0} XP</span>
            </div>
        </header>

        {/* Filter Bar */}
        <div className="flex justify-between items-end mb-8 border-b-2 border-black dark:border-white pb-4">
            <div className="flex gap-6">
                <button 
                    onClick={() => setActiveTab('FRAME')}
                    className={`text-2xl font-bold pb-1 transition-colors ${activeTab === 'FRAME' ? 'border-b-4 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 border-b-4 border-transparent'}`}
                >
                    FRAMES
                </button>
                <button 
                    onClick={() => setActiveTab('THEME')}
                    className={`text-2xl font-bold pb-1 transition-colors ${activeTab === 'THEME' ? 'border-b-4 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 border-b-4 border-transparent'}`}
                >
                    THEMES
                </button>
            </div>
            <button 
                onClick={() => setShowOwned(!showOwned)}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-white transition-all ${showOwned ? 'bg-black text-white dark:bg-white dark:text-gray-900' : 'bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'}`}
            >
                <ShoppingBag size={18} />
                <span className="uppercase font-bold">{showOwned ? 'Show All' : 'Show Owned'}</span>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
                <PixelCard key={item.id} className="flex flex-col h-full">
                    {/* Visual Preview Area */}
                    {item.type === 'THEME' ? (
                        <div className="mb-4 relative">
                            {item.owned && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 border border-black font-bold uppercase z-10">
                                    Owned
                                </div>
                            )}
                            <ThemePreview config={THEME_CONFIGS[item.id]} />
                        </div>
                    ) : (
                        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 h-48 mb-4 relative flex items-center justify-center">
                            {item.owned && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 border border-black font-bold uppercase">
                                    Owned
                                </div>
                            )}
                            <span className="text-gray-400">Preview: {item.name}</span>
                            {item.name.includes('Fire') && <div className="absolute inset-0 border-4 border-red-500 opacity-50"></div>}
                            {item.name.includes('Gold') && <div className="absolute inset-0 border-4 border-yellow-500 opacity-50"></div>}
                        </div>
                    )}
                    
                    <div className="mb-6 flex-1">
                        <h3 className="text-3xl font-bold uppercase mb-1">{item.name}</h3>
                        <p className="text-gray-500">{item.type} Item</p>
                    </div>

                    {item.owned ? (
                        item.equipped ? (
                            <button disabled className="w-full bg-gray-200 text-gray-500 border-2 border-gray-400 py-3 text-xl font-bold flex justify-center items-center gap-2">
                                <Check size={20} /> EQUIPPED
                            </button>
                        ) : (
                            <PixelButton variant="secondary" fullWidth onClick={() => equipItem(item.id)}>
                                EQUIP
                            </PixelButton>
                        )
                    ) : (
                        <PixelButton fullWidth onClick={() => buyItem(item.id)} disabled={user?.role !== 'ADMIN' && (user?.points ?? 0) < item.cost}>
                            BUY <span className="ml-2 bg-white/20 px-1 rounded text-sm">{item.cost} XP {user?.role === 'ADMIN' ? '(FREE)' : ''}</span>
                        </PixelButton>
                    )}
                </PixelCard>
            ))}
        </div>
    </div>
  );
};
