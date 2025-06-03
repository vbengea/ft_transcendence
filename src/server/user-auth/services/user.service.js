

const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');

function createUserService(db) {
	return {
		async getUserByEmail(email) {
			return await db.get(
				`SELECT id, email, username, password_hash AS passwordHash, two_fa_enabled, two_fa_secret FROM users WHERE email = ?`,
				[email]
			);
		},

		async getUserById(id) {
			return await db.get(`SELECT * FROM users WHERE id = ?`, [id]);
		},

		async createUser(email, username, plainPassword) {
			const passwordHash = await bcrypt.hash(plainPassword, 10);
			const result = await db.run(
				`INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)`,
				[email, username, passwordHash]
			);
			return { id: result.lastID, email, username };
		},

		async userExists(email, username) {
			return await db.get(
				`SELECT 1 FROM users WHERE email = ? OR username = ?`,
				[email, username]
			);
		},

		async save2FASecret(userId, secret) {
			await db.run(
				`UPDATE users SET two_fa_secret = ? WHERE id = ?`,
				[secret, userId]
			);
		},

		async enable2FA(userId) {
			await db.run(
				`UPDATE users SET two_fa_enabled = 1 WHERE id = ?`,
				[userId]
			);
		},

		verify2FACode(secret, code) {
			return speakeasy.totp.verify({
				secret,
				encoding: 'base32',
				token: code,
				window: 1
			});
		},

		validatePassword(plain, hash) {
			return bcrypt.compare(plain, hash);
		}
	};
}

module.exports = createUserService;
