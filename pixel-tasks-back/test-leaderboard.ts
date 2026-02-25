import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';
import { gameHubService } from './src/modules/gamehub/gamehub.service.js';

async function run() {
  const allUsers = await db.select().from(users).limit(1);
  if (allUsers.length > 0) {
    const userId = allUsers[0].id;
    console.log('Testing with user:', allUsers[0].name);
    
    // Simulate game score of 1234
    await gameHubService.updateHighScoreIfGreater(userId, '2048', 1234);
    
    // Test getUserHighScore
    const score = await gameHubService.getUserHighScore(userId, '2048');
    console.log('User High Score:', score);
    
    // Test getTop10HighScores
    const top10 = await gameHubService.getTop10HighScores('2048');
    console.log('Top 10 Leaderboard:', top10);
  } else {
    console.log('No users found in DB to test.');
  }
  process.exit(0);
}
run();
