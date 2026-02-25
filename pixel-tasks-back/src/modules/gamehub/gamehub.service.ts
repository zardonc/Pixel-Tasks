import { db } from '../../db/index.js';
import { gameHighScores, users } from '../../db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import TSID from 'tsid';

export const gameHubService = {
  async getUserHighScore(userId: string, gameId: string) {
    const result = await db
      .select({ highScore: gameHighScores.highScore })
      .from(gameHighScores)
      .where(
        and(
          eq(gameHighScores.userId, userId),
          eq(gameHighScores.gameId, gameId)
        )
      )
      .limit(1);
      
    return result[0]?.highScore ?? 0;
  },

  async getTop10HighScores(gameId: string) {
    const leaderboard = await db
      .select({
        userId: gameHighScores.userId,
        name: users.name, 
        highScore: gameHighScores.highScore,
        updatedAt: gameHighScores.updatedAt
      })
      .from(gameHighScores)
      .innerJoin(users, eq(gameHighScores.userId, users.id))
      .where(eq(gameHighScores.gameId, gameId))
      .orderBy(desc(gameHighScores.highScore))
      .limit(10);
      
    return leaderboard;
  },

  async updateHighScoreIfGreater(userId: string, gameId: string, newScore: number) {
    const id = typeof TSID.next() === 'string' ? TSID.next() : String(TSID.next());

    await db.insert(gameHighScores)
      .values({
        id,
        userId,
        gameId,
        highScore: newScore
      })
      .onConflictDoUpdate({
        target: [gameHighScores.userId, gameHighScores.gameId],
        set: {
          highScore: sql`MAX(${gameHighScores.highScore}, excluded.high_score)`,
          updatedAt: sql`CASE 
            WHEN excluded.high_score > ${gameHighScores.highScore} 
            THEN excluded.updated_at 
            ELSE ${gameHighScores.updatedAt} 
          END`
        }
      });
  }
};
