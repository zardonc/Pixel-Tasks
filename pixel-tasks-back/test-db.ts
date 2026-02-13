import { db } from './src/db/index.js';
console.log('DB loaded:', typeof db);
console.log('DB mode:', process.env.DB_MODE || 'sqlite (default)');
