import { db } from '../../db/index.js';
import { gameConfig } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

// ── XP Rules Type ──
export interface XpRules {
  xpByPriority: { LOW: number; MEDIUM: number; HIGH: number };
  levelThresholds: number[];
  dailyHighXpCap: number;
  onTimeBonus: {
    weight: number;
    earlyBonusPerMin: number;
    maxEarlyMinutes: number;
  };
}

// ── PRD Default Values ──
const DEFAULT_XP_RULES: XpRules = {
  xpByPriority: { LOW: 10, MEDIUM: 25, HIGH: 60 },
  levelThresholds: [0, 200, 500, 900, 1500, 2300, 3300, 4600, 6200, 8200],
  dailyHighXpCap: 300,
  onTimeBonus: {
    weight: 0.4,
    earlyBonusPerMin: 0.0025,
    maxEarlyMinutes: 120,
  },
};

const CONFIG_KEY = 'xp_rules';

class ConfigService {
  private cache: XpRules | null = null;

  /**
   * Read XP config �?returns cached value, falls back to DB, auto-seeds defaults.
   */
  async getXpConfig(): Promise<XpRules> {
    if (this.cache) return this.cache;

    const [row] = await db
      .select()
      .from(gameConfig)
      .where(eq(gameConfig.key, CONFIG_KEY))
      .limit(1);

    if (row) {
      this.cache = JSON.parse(row.value) as XpRules;
      return this.cache;
    }

    // Auto-seed defaults on first access
    await db.insert(gameConfig).values({
      key: CONFIG_KEY,
      value: JSON.stringify(DEFAULT_XP_RULES),
      version: 1,
    });

    this.cache = { ...DEFAULT_XP_RULES };
    return this.cache;
  }

  /**
   * Update XP config (admin only). Validates, writes, increments version, invalidates cache.
   */
  async updateXpConfig(data: XpRules, adminUserId: string): Promise<{ version: number }> {
    // Basic validation
    if (!data.xpByPriority || !data.levelThresholds || !data.dailyHighXpCap || !data.onTimeBonus) {
      throw new Error('Invalid XP config: missing required fields');
    }

    const [current] = await db
      .select({ version: gameConfig.version })
      .from(gameConfig)
      .where(eq(gameConfig.key, CONFIG_KEY))
      .limit(1);

    const newVersion = current ? current.version + 1 : 1;

    if (current) {
      await db
        .update(gameConfig)
        .set({
          value: JSON.stringify(data),
          version: newVersion,
          updatedBy: adminUserId,
          updatedAt: new Date(),
        })
        .where(eq(gameConfig.key, CONFIG_KEY));
    } else {
      await db.insert(gameConfig).values({
        key: CONFIG_KEY,
        value: JSON.stringify(data),
        version: newVersion,
        updatedBy: adminUserId,
      });
    }

    // Invalidate cache
    this.cache = null;

    console.log(`[ConfigService] XP config updated to v${newVersion} by ${adminUserId}`);
    return { version: newVersion };
  }

  // ── Helper functions (use cached config) ──

  async calculateLevel(totalXP: number): Promise<number> {
    const config = await this.getXpConfig();
    const thresholds = config.levelThresholds;
    let level = 1;
    for (let i = 1; i < thresholds.length; i++) {
      if (totalXP >= (thresholds[i] as number)) {
        level = i + 1;
      } else {
        break;
      }
    }
    return level;
  }

  async getLevelProgress(totalXP: number): Promise<{ current: number; required: number; percentage: number }> {
    const config = await this.getXpConfig();
    const thresholds = config.levelThresholds;
    const level = await this.calculateLevel(totalXP);

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
}

export const configService = new ConfigService();
