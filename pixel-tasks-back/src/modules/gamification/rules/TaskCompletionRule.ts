import { type Rule, type GamificationEvent, EventType } from './BaseRule.js';

export class TaskCompletionRule implements Rule {
  id = 'TASK_COMPLETION_BASE';

  matches(event: GamificationEvent): boolean {
    return event.type === EventType.TASK_COMPLETE;
  }

  calculateReward(event: GamificationEvent): number {
    if (event.payload.xpReward) {
      return event.payload.xpReward;
    }

    // Extract difficulty from payload (default to EASY if missing)
    const difficulty = event.payload.difficulty || 'EASY';

    switch (difficulty) {
      case 'HARD':
        return 50;
      case 'MEDIUM':
        return 30;
      case 'EASY':
      default:
        return 10;
    }
  }
}
