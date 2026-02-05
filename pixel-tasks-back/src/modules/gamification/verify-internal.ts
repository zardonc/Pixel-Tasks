import { xpEngine } from './XPEngine.js';
import { EventType } from './rules/BaseRule.js';

function verifyRuleEngine() {
  console.log('--- Verifying XP Rule Engine (Internal) ---');

  // Scenario 1: Complete an EASY task
  const event1 = {
    type: EventType.TASK_COMPLETE,
    userId: 'user-1',
    payload: { taskId: 't1', difficulty: 'EASY' },
    timestamp: new Date()
  };
  const xp1 = xpEngine.calculateXP(event1);
  console.log(`Scenario 1 (Easy Task): Expected 10, Got ${xp1}`);
  if (xp1 !== 10) throw new Error('Scenario 1 Failed');

  // Scenario 2: Complete a HARD task
  const event2 = {
    type: EventType.TASK_COMPLETE,
    userId: 'user-1',
    payload: { taskId: 't2', difficulty: 'HARD' },
    timestamp: new Date()
  };
  const xp2 = xpEngine.calculateXP(event2);
  console.log(`Scenario 2 (Hard Task): Expected 50, Got ${xp2}`);
  if (xp2 !== 50) throw new Error('Scenario 2 Failed');

  // Scenario 3: Daily Login
  const event3 = {
    type: EventType.DAILY_LOGIN,
    userId: 'user-1',
    payload: {},
    timestamp: new Date()
  };
  const xp3 = xpEngine.calculateXP(event3);
  console.log(`Scenario 3 (Daily Login): Expected 100, Got ${xp3}`);
  if (xp3 !== 100) throw new Error('Scenario 3 Failed');

  console.log('--- XP Rule Engine Verification Passed ---');
}

verifyRuleEngine();
