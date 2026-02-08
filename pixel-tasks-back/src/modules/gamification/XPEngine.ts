import { type Rule, type GamificationEvent, EventType } from './rules/BaseRule.js';
import { TaskCompletionRule } from './rules/TaskCompletionRule.js';
import { DailyLoginRule } from './rules/DailyLoginRule.js';

class XPEngine {
  private rules: Rule[] = [];

  constructor() {
    // Register Default Rules
    this.registerRule(new TaskCompletionRule());
    this.registerRule(new DailyLoginRule());
  }

  registerRule(rule: Rule) {
    this.rules.push(rule);
  }

  /**
   * Process an event and calculate total XP reward.
   * Can apply multiple rules if they match.
   */
  calculateXP(event: GamificationEvent): number {
    let totalXP = 0;

    for (const rule of this.rules) {
      if (rule.matches(event)) {
        const reward = rule.calculateReward(event);
        console.log(`[XPEngine] Rule [${rule.id}] matched. Reward: ${reward}`);
        totalXP += reward;
      }
    }

    return totalXP;
  }
  calculateLevel(totalXP: number): number {
    return Math.floor(totalXP / 100) + 1;
  }

  getLevelProgress(totalXP: number): number {
    return totalXP % 100;
  }
}

export const xpEngine = new XPEngine();
