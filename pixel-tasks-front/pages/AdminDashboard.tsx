import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { api } from '../api/client';
import { Settings, ShoppingBag, Trophy, Gamepad2, ShieldAlert } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { user } = useStore();
    const [activeTab, setActiveTab] = useState<'xp' | 'inventory' | 'hof' | 'games'>('xp');

    if (user?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold text-2xl">ACCESS DENIED. ADMINS ONLY.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="border-b-4 border-black dark:border-white pb-6 mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight uppercase flex items-center gap-4">
                    <ShieldAlert size={40} className="text-red-600" />
                    Admin Control Center
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                    System Configuration & Management
                </p>
            </header>

            {/* Tabs */}
            <div className="flex flex-wrap gap-4 border-b-2 border-gray-200 dark:border-gray-700 pb-1">
                <TabButton 
                    active={activeTab === 'xp'} 
                    onClick={() => setActiveTab('xp')} 
                    icon={<Settings size={20}/>} 
                    label="XP Rules Engine" 
                />
                <TabButton 
                    active={activeTab === 'inventory'} 
                    onClick={() => setActiveTab('inventory')} 
                    icon={<ShoppingBag size={20}/>} 
                    label="Inventory Mgmt" 
                />
                <TabButton 
                    active={activeTab === 'hof'} 
                    onClick={() => setActiveTab('hof')} 
                    icon={<Trophy size={20}/>} 
                    label="Hall of Fame Editor" 
                />
                <TabButton 
                    active={activeTab === 'games'} 
                    onClick={() => setActiveTab('games')} 
                    icon={<Gamepad2 size={20}/>} 
                    label="Game Hub Visibility" 
                />
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-card-dark border-4 border-black dark:border-white p-6 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.5)] min-h-[400px]">
                {activeTab === 'xp' && <XPRulesPanel />}
                {activeTab === 'inventory' && <InventoryPanel />}
                {activeTab === 'hof' && <HallOfFamePanel />}
                {activeTab === 'games' && <GameHubPanel />}
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-6 py-3 font-bold text-lg transition-all
            ${active 
                ? 'bg-black text-white dark:bg-white dark:text-black translate-y-1' 
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
        `}
    >
        {icon}
        {label}
    </button>
);

// Components with Logic
const InventoryPanel = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        try {
            const { data } = await api.get('/admin/shop-items');
            setItems(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const toggleVisibility = async (id: string, current: boolean) => {
        try {
            await api.patch(`/admin/shop-items/${id}`, { isVisible: !current });
            setItems(items.map(i => i.id === id ? { ...i, isVisible: !current } : i));
        } catch (e) {
            console.error(e);
        }
    };

    if(loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
            <div className="grid gap-4">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-4 border bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${item.isVisible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-sm text-gray-500">{item.cost} XP | {item.type}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggleVisibility(item.id, item.isVisible)}
                            className={`px-4 py-2 font-bold text-white ${item.isVisible ? 'bg-red-500' : 'bg-green-500'}`}
                        >
                            {item.isVisible ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GameHubPanel = () => {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGames = async () => {
         try {
            const { data } = await api.get('/admin/games');
            setGames(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGames(); }, []);

    const toggleVisibility = async (id: string, current: boolean) => {
        try {
            await api.patch(`/admin/games/${id}`, { isVisible: !current });
            setGames(games.map(g => g.id === id ? { ...g, isVisible: !current } : g));
        } catch (e) {
            console.error(e);
        }
    };

    if(loading) return <div>Loading...</div>;

    return (
         <div>
            <h2 className="text-2xl font-bold mb-4">Game Hub Visibility</h2>
            <div className="grid gap-4">
                {games.map(game => (
                    <div key={game.id} className="flex justify-between items-center p-4 border bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-4">
                             <div className={`w-3 h-3 rounded-full ${game.isVisible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                             <h3 className="font-bold">{game.name}</h3>
                        </div>
                        <button 
                            onClick={() => toggleVisibility(game.id, game.isVisible)}
                             className={`px-4 py-2 font-bold text-white ${game.isVisible ? 'bg-red-500' : 'bg-green-500'}`}
                        >
                            {game.isVisible ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const XPRulesPanel = () => {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    const fetchConfig = async () => {
        try {
            const { data } = await api.get('/admin/xp-config');
            setConfig(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchConfig(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Parse comma-separated thresholds back to array
            const thresholds = typeof config.levelThresholds === 'string' 
                ? config.levelThresholds.split(',').map(Number) 
                : config.levelThresholds;

            const payload = { ...config, levelThresholds: thresholds };
            
            await api.post('/admin/xp-config', payload);
            setMsg('Saved successfully!');
            setTimeout(() => setMsg(''), 3000);
        } catch (e) {
            console.error(e);
            setMsg('Error saving config.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!config) return <div>Error loading config.</div>;

    return (
        <form onSubmit={handleSave}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">XP Rules Engine</h2>
                {msg && <span className="font-bold text-green-600 animate-pulse">{msg}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Priority Multipliers */}
                <div className="bg-gray-50 p-4 border block">
                    <h3 className="font-bold border-b pb-2 mb-4">Task Priority XP</h3>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-bold text-gray-500">LOW Priority</span>
                            <input 
                                type="number" 
                                className="w-full p-2 border mt-1" 
                                value={config.xpByPriority?.LOW} 
                                onChange={e => setConfig({ ...config, xpByPriority: { ...config.xpByPriority, LOW: Number(e.target.value) } })} 
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold text-gray-500">MEDIUM Priority</span>
                            <input 
                                type="number" 
                                className="w-full p-2 border mt-1" 
                                value={config.xpByPriority?.MEDIUM} 
                                onChange={e => setConfig({ ...config, xpByPriority: { ...config.xpByPriority, MEDIUM: Number(e.target.value) } })} 
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold text-gray-500">HIGH Priority</span>
                            <input 
                                type="number" 
                                className="w-full p-2 border mt-1" 
                                value={config.xpByPriority?.HIGH} 
                                onChange={e => setConfig({ ...config, xpByPriority: { ...config.xpByPriority, HIGH: Number(e.target.value) } })} 
                            />
                        </label>
                    </div>
                </div>

                {/* On-Time Bonus */}
                <div className="bg-gray-50 p-4 border block">
                    <h3 className="font-bold border-b pb-2 mb-4">On-Time Bonus Logic</h3>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-bold text-gray-500">Base Weight (0-1)</span>
                            <input 
                                type="number" step="0.1" 
                                className="w-full p-2 border mt-1" 
                                value={config.onTimeBonus?.weight} 
                                onChange={e => setConfig({ ...config, onTimeBonus: { ...config.onTimeBonus, weight: Number(e.target.value) } })} 
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold text-gray-500">Bonus Per Minute Early</span>
                            <input 
                                type="number" step="0.001" 
                                className="w-full p-2 border mt-1" 
                                value={config.onTimeBonus?.earlyBonusPerMin} 
                                onChange={e => setConfig({ ...config, onTimeBonus: { ...config.onTimeBonus, earlyBonusPerMin: Number(e.target.value) } })} 
                            />
                        </label>
                         <label className="block">
                            <span className="text-sm font-bold text-gray-500">Max Early Minutes Cap</span>
                            <input 
                                type="number" 
                                className="w-full p-2 border mt-1" 
                                value={config.onTimeBonus?.maxEarlyMinutes} 
                                onChange={e => setConfig({ ...config, onTimeBonus: { ...config.onTimeBonus, maxEarlyMinutes: Number(e.target.value) } })} 
                            />
                        </label>
                    </div>
                </div>

                {/* Global Settings */}
                <div className="bg-gray-50 p-4 border block md:col-span-2">
                    <h3 className="font-bold border-b pb-2 mb-4">Global Constants</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-sm font-bold text-gray-500">Daily High XP Cap</span>
                            <input 
                                type="number" 
                                className="w-full p-2 border mt-1" 
                                value={config.dailyHighXpCap} 
                                onChange={e => setConfig({ ...config, dailyHighXpCap: Number(e.target.value) })} 
                            />
                        </label>
                         <label className="block">
                            <span className="text-sm font-bold text-gray-500">Level Thresholds (Comma Separated)</span>
                            <input 
                                type="text" 
                                className="w-full p-2 border mt-1" 
                                value={Array.isArray(config.levelThresholds) ? config.levelThresholds.join(',') : config.levelThresholds} 
                                onChange={e => setConfig({ ...config, levelThresholds: e.target.value })} 
                            />
                        </label>
                    </div>
                </div>
            </div>

            <button type="submit" className="mt-6 bg-black text-white px-8 py-4 font-bold text-xl uppercase tracking-widest hover:scale-105 transition-transform">
                Save System Config
            </button>
        </form>
    );
};

const HallOfFamePanel = () => {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '', description: '', reward: 100, maxProgress: 1, icon: 'trophy', isVisible: true
    });

    const fetchAchievements = async () => {
        try {
            const { data } = await api.get('/admin/achievements');
            setAchievements(data);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAchievements(); }, []);

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/admin/achievements/${deleteId}`);
            setAchievements(achievements.filter(a => a.id !== deleteId));
            setDeleteId(null);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isCreating) {
                const { data } = await api.post('/admin/achievements', formData);
                setAchievements([...achievements, data]);
                setIsCreating(false);
            } else if (editing) {
                await api.put(`/admin/achievements/${editing.id}`, formData);
                setAchievements(achievements.map(a => a.id === editing.id ? { ...a, ...formData } : a));
                setEditing(null);
            }
            setFormData({ title: '', description: '', reward: 100, maxProgress: 1, icon: 'trophy', isVisible: true });
        } catch (err) { console.error(err); }
    };

    const startEdit = (ach: any) => {
        setEditing(ach);
        setIsCreating(false);
        setFormData({
            title: ach.title, description: ach.description, reward: ach.reward, 
            maxProgress: ach.maxProgress, icon: ach.icon, isVisible: ach.isVisible
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
             {/* Delete Confirmation Modal */}
             {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-card-dark border-4 border-black p-6 max-w-sm w-full shadow-[8px_8px_0_0_#000]">
                        <h3 className="text-xl font-bold mb-4 uppercase">Confirm Delete?</h3>
                        <p className="mb-6 text-gray-600 dark:text-gray-400">This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                CANCEL
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700"
                            >
                                DELETE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Hall of Fame Editor</h2>
                {!isCreating && !editing && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="bg-black text-white px-4 py-2 font-bold hover:bg-gray-800"
                    >
                        + NEW ACHIEVEMENT
                    </button>
                )}
            </div>

            {(isCreating || editing) && (
                <form onSubmit={handleSubmit} className="bg-gray-100 p-6 mb-6 border-2 border-black">
                    <h3 className="font-bold mb-4">{isCreating ? 'Create Achievement' : 'Edit Achievement'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input className="p-2 border" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        <input className="p-2 border" placeholder="Icon (lucide name)" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
                        <input className="p-2 border md:col-span-2" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                        <div className="flex items-center gap-2">
                            <label>Reward (XP):</label>
                            <input type="number" className="p-2 border w-24" value={formData.reward} onChange={e => setFormData({...formData, reward: Number(e.target.value)})} />
                        </div>
                        <div className="flex items-center gap-2">
                            <label>Max Progress:</label>
                            <input type="number" className="p-2 border w-24" value={formData.maxProgress} onChange={e => setFormData({...formData, maxProgress: Number(e.target.value)})} />
                        </div>
                        <div className="flex items-center gap-2">
                             <input type="checkbox" checked={formData.isVisible} onChange={e => setFormData({...formData, isVisible: e.target.checked})} />
                             <label>Is Visible</label>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 font-bold">SAVE</button>
                        <button type="button" onClick={() => { setIsCreating(false); setEditing(null); }} className="bg-gray-400 text-white px-6 py-2 font-bold">CANCEL</button>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {achievements.map(ach => (
                    <div key={ach.id} className="flex justify-between items-center p-4 border bg-gray-50 dark:bg-gray-800">
                        <div>
                             <h3 className="font-bold text-lg">{ach.title} {ach.isVisible ? '' : '(Hidden)'}</h3>
                             <p className="text-sm text-gray-500">{ach.description} | {ach.reward} XP</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => startEdit(ach)} className="px-3 py-1 bg-blue-500 text-white font-bold text-sm">EDIT</button>
                            <button onClick={() => setDeleteId(ach.id)} className="px-3 py-1 bg-red-500 text-white font-bold text-sm">DELETE</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
