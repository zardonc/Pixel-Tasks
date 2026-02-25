export enum EventType {
  TASK_COMPLETE = 'TASK_COMPLETE',
  DAILY_LOGIN = 'DAILY_LOGIN',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  GAME_SESSION_COMPLETE = 'GAME_SESSION_COMPLETE',
}

export interface GamificationEvent {
  type: EventType;
  userId: string;
  payload: Record<string, any>; // Flexible payload: taskId, difficulty, etc.
  timestamp: Date;
}

export interface Rule {
  /**
   * Unique identifier for the rule (for debugging/config)
   */
  id: string;

  /**
   * Whether this rule applies to the given event
   */
  matches(event: GamificationEvent): boolean;

  /**
   * Calculate XP reward for the event
   */
  calculateReward(event: GamificationEvent): number;
}
