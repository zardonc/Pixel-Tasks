import Database from 'better-sqlite3';

const DB_PATH = process.env.DATABASE_URL || 'local.db';
const sqlite = new Database(DB_PATH);

console.log('Seeding shop items...');

const items = [
    { id: 'default', name: 'Original Light', type: 'THEME', cost: 0 },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', type: 'THEME', cost: 1000 },
    { id: 'dark', name: 'Midnight Dark', type: 'THEME', cost: 500 },
];

const insert = sqlite.prepare(`
    INSERT OR REPLACE INTO shop_items (id, name, type, cost, is_visible)
    VALUES (@id, @name, @type, @cost, 1)
`);

const createTable = sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS shop_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      cost INTEGER NOT NULL,
      image TEXT,
      is_visible INTEGER DEFAULT 1 NOT NULL,
      "check" TEXT DEFAULT 'LOCKED',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
`);

createTable.run();

sqlite.transaction(() => {
    for (const item of items) {
        insert.run(item);
    }
})();

console.log('Done seeding shop items.');
sqlite.close();
