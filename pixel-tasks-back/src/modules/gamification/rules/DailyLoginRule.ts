import { type Rule, type GamificationEvent, EventType } from './BaseRule.js';

export class DailyLoginRule implements Rule {
  id = 'DAILY_LOGIN_BONUS';

  matches(event: GamificationEvent): boolean {
    return event.type === EventType.DAILY_LOGIN;
  }

  calculateReward(event: GamificationEvent): number {
    // Simple flat bonus
    return 100;
  }
}
