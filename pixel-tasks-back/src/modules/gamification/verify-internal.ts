import { xpEngine } from './XPEngine.js';
import { EventType } from './rules/BaseRule.js';
import { configService } from '../config/config.service.js';

async function verifyRuleEngine() {
  console.log('--- Verifying XP Rule Engine (Internal) ---');

  // Pre-load config to ensure defaults are seeded
  const config = await configService.getXpConfig();
  console.log('Config loaded:', JSON.stringify(config.xpByPriority));

  // Scenario 1: Complete a LOW priority task (PRD: 10 XP)
  const event1 = {
    type: EventType.TASK_COMPLETE,
    userId: 'user-1',
    payload: { taskId: 't1', difficulty: 'LOW' },
    timestamp: new Date()
  };
  const xp1 = await xpEngine.calculateXP(event1);
  console.log(`Scenario 1 (Low Task): Expected 10, Got ${xp1}`);
  if (xp1 !== 10) throw new Error(`Scenario 1 Failed: expected 10, got ${xp1}`);

  // Scenario 2: Complete a MEDIUM priority task (PRD: 25 XP)
  const event2 = {
    type: EventType.TASK_COMPLETE,
    userId: 'user-1',
    payload: { taskId: 't2', difficulty: 'MEDIUM' },
    timestamp: new Date()
  };
  const xp2 = await xpEngine.calculateXP(event2);
  console.log(`Scenario 2 (Medium Task): Expected 25, Got ${xp2}`);
  if (xp2 !== 25) throw new Error(`Scenario 2 Failed: expected 25, got ${xp2}`);

  // Scenario 3: Complete a HIGH priority task (PRD: 60 XP)
  const event3 = {
    type: EventType.TASK_COMPLETE,
    userId: 'user-1',
    payload: { taskId: 't3', difficulty: 'HIGH' },
    timestamp: new Date()
  };
  const xp3 = await xpEngine.calculateXP(event3);
  console.log(`Scenario 3 (High Task): Expected 60, Got ${xp3}`);
  if (xp3 !== 60) throw new Error(`Scenario 3 Failed: expected 60, got ${xp3}`);

  // Scenario 4: On-time bonus — Task with dueDate 60 min in the future
  const now = new Date();
  const dueIn60Min = new Date(now.getTime() + 60 * 60000);
  const event4 = {
    type: EventType.TASK_COMPLETE,
    userId: 'user-1',
    payload: {
      taskId: 't4',
      difficulty: 'MEDIUM',
      dueDate: dueIn60Min.toISOString(),
      completedAt: now.toISOString(),
    },
    timestamp: now
  };
  const xp4 = await xpEngine.calculateXP(event4);
  // Expected: 25 * (1 + 0.0025 * 60) = 25 * 1.15 = 28.75 → floor = 28
  console.log(`Scenario 4 (Medium + 60min early): Expected 28, Got ${xp4}`);
  if (xp4 !== 28) throw new Error(`Scenario 4 Failed: expected 28, got ${xp4}`);

  // Scenario 5: Level thresholds
  const level1 = await xpEngine.calculateLevel(0);
  const level2 = await xpEngine.calculateLevel(200);
  const level3 = await xpEngine.calculateLevel(500);
  const level5 = await xpEngine.calculateLevel(1500);
  const level10 = await xpEngine.calculateLevel(8200);
  console.log(`Level thresholds: 0→L${level1}, 200→L${level2}, 500→L${level3}, 1500→L${level5}, 8200→L${level10}`);
  if (level1 !== 1) throw new Error(`Level calc failed: 0 XP should be L1, got L${level1}`);
  if (level2 !== 2) throw new Error(`Level calc failed: 200 XP should be L2, got L${level2}`);
  if (level3 !== 3) throw new Error(`Level calc failed: 500 XP should be L3, got L${level3}`);
  if (level5 !== 5) throw new Error(`Level calc failed: 1500 XP should be L5, got L${level5}`);
  if (level10 !== 10) throw new Error(`Level calc failed: 8200 XP should be L10, got L${level10}`);

  // Scenario 6: Level progress
  const progress = await xpEngine.getLevelProgress(350);
  // 350 XP = Level 2 (threshold 200). Band = 200→500 (300 XP). Progress = 150/300 = 50%
  console.log(`Level progress at 350 XP: ${progress.current}/${progress.required} (${progress.percentage}%)`);
  if (progress.current !== 150 || progress.required !== 300 || progress.percentage !== 50) {
    throw new Error(`Progress calc failed: expected 150/300/50%, got ${progress.current}/${progress.required}/${progress.percentage}%`);
  }

  // Scenario 7: Daily Login (unchanged — 100 XP flat)
  const event7 = {
    type: EventType.DAILY_LOGIN,
    userId: 'user-1',
    payload: {},
    timestamp: new Date()
  };
  const xp7 = await xpEngine.calculateXP(event7);
  console.log(`Scenario 7 (Daily Login): Expected 100, Got ${xp7}`);
  if (xp7 !== 100) throw new Error(`Scenario 7 Failed: expected 100, got ${xp7}`);

  console.log('--- XP Rule Engine Verification Passed ✓ ---');
}

verifyRuleEngine().catch((err) => {
  console.error('Verification FAILED:', err.message);
  process.exit(1);
});
