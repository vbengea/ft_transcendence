

const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');

function createUserService(prisma) {
	return {
		async getUserByEmail(email) {
			return prisma.user.findUnique({
				where: { email }
			});
		},

		async getUserById(id) {
			return prisma.user.findUnique({
				where: { id }
			});
		},

		async createUser(email, name, plainPassword) {
			const passwordHash = await bcrypt.hash(plainPassword, 10);
			
			return prisma.user.create({
				data: {
					email,
					name,
					passwordHash
				},
				select: {
					id: true,
					email: true,
					name: true
				}
			});
		},

		async userExists(email, name) {
			const count = await prisma.user.count({
				where: {
					OR: [
						{ email },
						{ name }
					]
				}
			});
			return count > 0;
		},

		async save2FASecret(userId, secret) {
			return prisma.user.update({
				where: { id: userId },
				data: { two_fa_secret: secret }
			});
		},

		async enable2FA(userId) {
			return prisma.user.update({
				where: { id: userId },
				data: { two_fa_enabled: true }
			});
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
		},

		async getByGoogleId(googleId) {
			return prisma.user.findUnique({
				where: { googleId }
			});
		},

		async createGoogleUser({ google_id, email, name, avatar }) {
			return prisma.user.create({
				data: {
					email,
					name: name,
					googleId: google_id,
					avatar
				},
				select: {
					id: true,
					email: true,
					name: true
				}
			});
		}
	};
}

module.exports = createUserService;
