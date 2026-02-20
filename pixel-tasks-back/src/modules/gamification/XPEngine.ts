import { type Rule, type GamificationEvent, EventType } from './rules/BaseRule.js';
import { TaskCompletionRule } from './rules/TaskCompletionRule.js';
import { DailyLoginRule } from './rules/DailyLoginRule.js';
import { configService } from '../config/config.service.js';

class XPEngine {
  private rules: Rule[] = [];
  private asyncRules: TaskCompletionRule[] = [];

  constructor() {
    // Register Default Rules
    const taskRule = new TaskCompletionRule();
    this.registerRule(taskRule);
    this.asyncRules.push(taskRule);

    this.registerRule(new DailyLoginRule());
  }

  registerRule(rule: Rule) {
    this.rules.push(rule);
  }

  /**
   * Process an event and calculate total XP reward.
   * Uses async config-driven rules where available.
   */
  async calculateXP(event: GamificationEvent): Promise<number> {
    let totalXP = 0;

    for (const rule of this.rules) {
      if (rule.matches(event)) {
        // Check if this rule has an async variant
        const asyncRule = this.asyncRules.find(r => r.id === rule.id);
        if (asyncRule) {
          const reward = await asyncRule.calculateRewardAsync(event);
          console.log(`[XPEngine] Rule [${rule.id}] matched (async). Reward: ${reward}`);
          totalXP += reward;
        } else {
          const reward = rule.calculateReward(event);
          console.log(`[XPEngine] Rule [${rule.id}] matched. Reward: ${reward}`);
          totalXP += reward;
        }
      }
    }

    return totalXP;
  }

  /**
   * Calculate level from total XP using config-driven thresholds.
   */
  async calculateLevel(totalXP: number): Promise<number> {
    return configService.calculateLevel(totalXP);
  }

  /**
   * Get progress within current level band.
   */
  async getLevelProgress(totalXP: number) {
    return configService.getLevelProgress(totalXP);
  }
}

export const xpEngine = new XPEngine();
