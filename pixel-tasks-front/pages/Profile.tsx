import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { userService } from '../services/user.service';
import { PixelCard, PixelButton, PixelInput } from '../components/ui/PixelComponents';
import { Shield, Star, Zap, Lock, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateLevel, getLevelProgress, fetchXpConfig } from '../utils/levelConfig';

export const Profile: React.FC = () => {
  const { user } = useStore();

  // Password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!user) return null;

  // Fetch XP config on mount
  useEffect(() => { fetchXpConfig(); }, []);

  // XP calculation (config-driven thresholds)
  const currentLevel = calculateLevel(user.points);
  const currentXP = user.points;
  const progress = getLevelProgress(user.points);
  const progressXP = progress.current;
  const xpRequired = progress.required;
  const percentage = progress.percentage;
  const xpToNextLevel = xpRequired - progressXP;

  // Level title based on level
  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'Legendary';
    if (level >= 30) return 'Master';
    if (level >= 20) return 'Expert';
    if (level >= 10) return 'Veteran';
    if (level >= 5) return 'Adventurer';
    return 'Novice';
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await userService.changePassword(oldPassword, newPassword);
      setFeedback({ type: 'success', message: result.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to change password';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-12">
        <h1
          className="text-5xl md:text-6xl font-bold uppercase tracking-widest mb-2"
          style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}
        >
          My Profile
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-400">Your hero stats & settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left Column: Hero Card ── */}
        <div className="space-y-8">
          {/* Hero Identity Card */}
          <PixelCard className="relative overflow-hidden">
            {/* Decorative top bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />

            <div className="flex items-center gap-6 pt-4">
              {/* Avatar */}
              <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 border-4 border-black dark:border-white flex items-center justify-center shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.3)] shrink-0">
                <span className="text-6xl select-none">
                  {user.companion === 'DOG' ? '🐶' : '🐱'}
                </span>
              </div>

              <div className="min-w-0">
                <h2 className="text-3xl font-bold uppercase truncate">{user.name || 'Hero'}</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 border-2 border-black dark:border-white px-3 py-1">
                  <Shield size={16} />
                  <span className="font-bold uppercase text-sm">{user.role}</span>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Level & XP Stats */}
          <PixelCard>
            <div className="flex items-center gap-3 mb-6">
              <Star size={28} className="text-yellow-500" />
              <h3 className="text-2xl font-bold uppercase tracking-wide">Level & XP</h3>
            </div>

            {/* Level Badge - Centered */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="relative"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-500 border-4 border-black dark:border-white shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.3)] flex flex-col items-center justify-center transform rotate-1 hover:rotate-0 transition-transform">
                  <span className="text-sm font-bold uppercase opacity-60">LEVEL</span>
                  <span className="text-5xl font-bold leading-none">{currentLevel}</span>
                  <span className="text-xs font-bold uppercase mt-1 opacity-75">{getLevelTitle(currentLevel)}</span>
                </div>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 border-2 border-black dark:border-white">
                <div className="text-gray-500 text-sm uppercase font-bold">Total XP</div>
                <div className="text-2xl font-bold text-orange-500">{currentXP.toLocaleString()}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 border-2 border-black dark:border-white">
                <div className="text-gray-500 text-sm uppercase font-bold">Progress</div>
                <div className="text-2xl font-bold text-green-500">{progressXP}/{xpRequired}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 border-2 border-black dark:border-white">
                <div className="text-gray-500 text-sm uppercase font-bold">Next LVL</div>
                <div className="text-2xl font-bold text-blue-500">{xpToNextLevel} XP</div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-bold uppercase">
                <span>LVL {currentLevel}</span>
                <span>LVL {currentLevel + 1}</span>
              </div>
              <div className="w-full h-8 border-3 border-black dark:border-white bg-gray-800 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')]" />

                {/* Fill */}
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ type: 'spring', stiffness: 50, damping: 10 }}
                >
                  <div className="absolute top-0 right-0 w-1 h-full bg-white opacity-50" />
                </motion.div>

                {/* Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm tracking-widest drop-shadow-md">
                    {progressXP} / {xpRequired} XP
                </div>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* ── Right Column: Settings ── */}
        <div className="space-y-8">
          {/* Change Password */}
          <PixelCard>
            <div className="flex items-center gap-3 mb-6">
              <Lock size={28} className="text-red-400" />
              <h3 className="text-2xl font-bold uppercase tracking-wide">Change Password</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <PixelInput
                label="Current Password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />

              <PixelInput
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
              />

              <PixelInput
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />

              {/* Feedback Message */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`
                      flex items-center gap-3 p-4 border-3 border-black dark:border-white font-bold text-lg
                      ${feedback.type === 'success'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }
                    `}
                  >
                    {feedback.type === 'success' ? <Check size={24} /> : <AlertTriangle size={24} />}
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <PixelButton
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting || !oldPassword || !newPassword || !confirmPassword}
              >
                <Lock size={18} />
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </PixelButton>
            </form>
          </PixelCard>

          {/* Account Info Card */}
          <PixelCard>
            <div className="flex items-center gap-3 mb-6">
              <Zap size={28} className="text-yellow-500" />
              <h3 className="text-2xl font-bold uppercase tracking-wide">Account Info</h3>
            </div>

            <div className="space-y-4">
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Role" value={user.role} />
              <InfoRow label="Companion" value={user.companion === 'DOG' ? '🐶 Dog' : '🐱 Cat'} />
              <InfoRow label="Member Since" value={
                (user as any).createdAt
                  ? new Date((user as any).createdAt * 1000).toLocaleDateString()
                  : 'N/A'
              } />
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-2 border-b-2 border-dashed border-gray-200 dark:border-gray-700 last:border-b-0">
    <span className="font-bold uppercase text-gray-500 dark:text-gray-400 text-lg">{label}</span>
    <span className="font-bold text-lg">{value}</span>
  </div>
);
