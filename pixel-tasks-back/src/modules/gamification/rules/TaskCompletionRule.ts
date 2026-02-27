import { type Rule, type GamificationEvent, EventType } from './BaseRule.js';
import { configService } from '../../config/config.service.js';

export class TaskCompletionRule implements Rule {
  id = 'TASK_COMPLETION_BASE';

  matches(event: GamificationEvent): boolean {
    return event.type === EventType.TASK_COMPLETE;
  }

  calculateReward(event: GamificationEvent): number {
    // Synchronous fallback â€?actual calculation done via calculateRewardAsync
    return 0;
  }

  /**
   * Async reward calculation using config-driven XP values.
   * Called directly by XPEngine instead of the sync interface.
   */
  async calculateRewardAsync(event: GamificationEvent): Promise<number> {
    const config = await configService.getXpConfig();
    const priority = (event.payload.difficulty || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH';

    // Base XP from config
    const baseXP = config.xpByPriority[priority] ?? config.xpByPriority.MEDIUM;

    // On-time bonus: if dueDate and completedAt exist, calculate early bonus
    let multiplier = 1;
    if (event.payload.dueDate && event.payload.completedAt) {
      const dueTime = new Date(event.payload.dueDate).getTime();
      const completedTime = new Date(event.payload.completedAt).getTime();
      const earlyMinutes = Math.max(0, (dueTime - completedTime) / 60000);
      const cappedMinutes = Math.min(earlyMinutes, config.onTimeBonus.maxEarlyMinutes);
      multiplier = 1 + config.onTimeBonus.earlyBonusPerMin * cappedMinutes;
    }

    return Math.floor(baseXP * multiplier);
  }
}
