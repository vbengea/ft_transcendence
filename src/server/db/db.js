const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

let db;

async function initDb() {
	if (!db) {
		db = await sqlite.open({
			filename: './data.sqlite',
			driver: sqlite3.Database
		});

		await db.exec(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				email TEXT UNIQUE NOT NULL,
				username TEXT UNIQUE NOT NULL,
				password_hash TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);
			`);

		try {
			await db.exec(`
				ALTER TABLE users ADD COLUMN two_fa_enabled INTEGER DEFAULT 0;
			`);
		} catch(err) {
			console.log('two_fa_enabled column already exists');
		}

		try {
			await db.exec(`
				ALTER TABLE users ADD COLUMN two_fa_secret TEXT;
			`);
		} catch (err) {
			console.log('two_fa_secret column already exists');
		}
	}
	return db;
}

module.exports = initDb;
