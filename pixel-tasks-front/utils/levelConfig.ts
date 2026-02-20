import { api } from '../api/client';

// ── XP Config Type (mirrors backend) ──
export interface XpConfig {
  xpByPriority: { LOW: number; MEDIUM: number; HIGH: number };
  levelThresholds: number[];
  dailyHighXpCap: number;
  onTimeBonus: {
    weight: number;
    earlyBonusPerMin: number;
    maxEarlyMinutes: number;
  };
}

// ── Default fallback (used before API responds) ──
const DEFAULT_CONFIG: XpConfig = {
  xpByPriority: { LOW: 10, MEDIUM: 25, HIGH: 60 },
  levelThresholds: [0, 200, 500, 900, 1500, 2300, 3300, 4600, 6200, 8200],
  dailyHighXpCap: 300,
  onTimeBonus: { weight: 0.4, earlyBonusPerMin: 0.0025, maxEarlyMinutes: 120 },
};

let cachedConfig: XpConfig | null = null;

/**
 * Fetch XP config from backend. Caches the result.
 */
export async function fetchXpConfig(): Promise<XpConfig> {
  if (cachedConfig) return cachedConfig;
  try {
    const res = await api.get('/config/xp');
    cachedConfig = res.data as XpConfig;
    return cachedConfig;
  } catch {
    console.warn('[levelConfig] Failed to fetch XP config, using defaults');
    return DEFAULT_CONFIG;
  }
}

/**
 * Get cached config synchronously (returns default if not yet fetched).
 */
export function getXpConfig(): XpConfig {
  return cachedConfig ?? DEFAULT_CONFIG;
}

/**
 * Invalidate cached config (e.g. after admin update).
 */
export function invalidateXpConfig() {
  cachedConfig = null;
}

// ── Helper Functions ──

export function calculateLevel(totalXP: number, config?: XpConfig): number {
  const thresholds = (config ?? getXpConfig()).levelThresholds;
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (totalXP >= thresholds[i]!) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

export function getLevelProgress(totalXP: number, config?: XpConfig): {
  current: number;
  required: number;
  percentage: number;
} {
  const cfg = config ?? getXpConfig();
  const thresholds = cfg.levelThresholds;
  const level = calculateLevel(totalXP, cfg);

  const currentThreshold = thresholds[level - 1] ?? 0;
  const nextThreshold = thresholds[level] ?? thresholds[thresholds.length - 1] ?? currentThreshold;

  const bandSize = nextThreshold - currentThreshold;
  const progressInBand = totalXP - currentThreshold;

  return {
    current: progressInBand,
    required: bandSize,
    percentage: bandSize > 0 ? Math.min(100, Math.floor((progressInBand / bandSize) * 100)) : 100,
  };
}

export function getXpForPriority(priority: 'LOW' | 'MEDIUM' | 'HIGH', config?: XpConfig): number {
  return (config ?? getXpConfig()).xpByPriority[priority];
}
