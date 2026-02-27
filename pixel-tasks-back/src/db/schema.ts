import * as pg from './schema.pg.js';
import * as sqlite from './schema.sqlite.js';

const rawMode = process.env.DB_MODE || process.env.db_mode || 'sqlite';
const DB_MODE = rawMode.toLowerCase();

export const users = DB_MODE === 'postgres' ? pg.users : sqlite.users as any;
export const pointsLog = DB_MODE === 'postgres' ? pg.pointsLog : sqlite.pointsLog as any;
export const lists = DB_MODE === 'postgres' ? pg.lists : sqlite.lists as any;
export const tasks = DB_MODE === 'postgres' ? pg.tasks : sqlite.tasks as any;
export const gameConfig = DB_MODE === 'postgres' ? pg.gameConfig : sqlite.gameConfig as any;
export const shopItems = DB_MODE === 'postgres' ? pg.shopItems : sqlite.shopItems as any;
export const games = DB_MODE === 'postgres' ? pg.games : sqlite.games as any;
export const achievements = DB_MODE === 'postgres' ? pg.achievements : sqlite.achievements as any;
export const userItems = DB_MODE === 'postgres' ? pg.userItems : sqlite.userItems as any;
export const shopTransactions = DB_MODE === 'postgres' ? pg.shopTransactions : sqlite.shopTransactions as any;
export const gameHighScores = DB_MODE === 'postgres' ? pg.gameHighScores : sqlite.gameHighScores as any;

export default DB_MODE === 'postgres' ? pg : sqlite as any;
