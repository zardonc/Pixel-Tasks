import { type Rule, type GamificationEvent, EventType } from './BaseRule.js';

export class GameSessionRule implements Rule {
  id = 'game_session_rule';

  matches(event: GamificationEvent): boolean {
    return event.type === EventType.GAME_SESSION_COMPLETE;
  }

  calculateReward(event: GamificationEvent): number {
    const { score } = event.payload;
    if (!score || typeof score !== 'number' || score <= 0) {
      return 0;
    }
    
    // Reward calculation: 1 XP for every 50 points scored in 2048
    // Adjust logic here if we add different games with varying score scales.
    return Math.floor(score / 50);
  }
}
