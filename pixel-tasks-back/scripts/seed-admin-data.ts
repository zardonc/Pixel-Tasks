import { db } from '../src/db/index.js';
import { shopItems, games, achievements } from '../src/db/schema.js';

// Shop Items Data (from frontend store.ts)
const SHOP_ITEMS = [
  { id: '1', name: 'No Frame', type: 'FRAME', cost: 0, image: '' },
  { id: '2', name: 'Fire Aura', type: 'FRAME', cost: 450, image: '' },
  { id: '3', name: 'Ice Crown', type: 'FRAME', cost: 1250, image: '' },
  { id: '4', name: 'Golden Frame', type: 'FRAME', cost: 2000, image: '' },
] as const;

// Games Data (from frontend GameHub.tsx)
const GAMES = [
  { id: 'sudoku', name: 'Sudoku', tag: 'Logic', description: 'Fill the grid with digits 1-9.', color: 'bg-blue-400' },
  { id: '2048', name: '2048', tag: 'Puzzle', description: 'Slide tiles to reach 2048.', color: 'bg-yellow-400' },
  { id: 'mines', name: 'Minesweeper', tag: 'Classic', description: 'Avoid the hidden bombs!', color: 'bg-red-400' },
] as const;

// Achievements Data (from frontend store.ts)
const ACHIEVEMENTS = [
  { id: '1', title: 'Novice Slayer', description: 'Complete your first 10 tasks.', reward: 200, maxProgress: 10, icon: 'swords' },
  { id: '2', title: 'Early Bird', description: 'Complete a task before 8:00 AM.', reward: 100, maxProgress: 1, icon: 'sun' },
  { id: '3', title: 'Streak Master', description: 'Maintain a 7-day login streak.', reward: 500, maxProgress: 7, icon: 'fire' },
  { id: 'daily_login', title: 'Daily Reward', description: 'Log in to the pixel world.', reward: 50, maxProgress: 1, icon: 'zap' },
] as const;

async function seed() {
  console.log('🌱 Seeding Admin Data...');

  // Seed Shop Items
  for (const item of SHOP_ITEMS) {
    await db.insert(shopItems).values(item).onConflictDoNothing().run();
  }
  console.log(`✅ Seeded ${SHOP_ITEMS.length} shop items.`);

  // Seed Games
  for (const game of GAMES) {
    await db.insert(games).values(game).onConflictDoNothing().run();
  }
  console.log(`✅ Seeded ${GAMES.length} games.`);

  // Seed Achievements
  for (const ach of ACHIEVEMENTS) {
    await db.insert(achievements).values(ach).onConflictDoNothing().run();
  }
  console.log(`✅ Seeded ${ACHIEVEMENTS.length} achievements.`);

  console.log('🏁 Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
