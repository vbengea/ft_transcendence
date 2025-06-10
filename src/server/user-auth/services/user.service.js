

const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const jdenticon = require("jdenticon")
const fs = require("fs");

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
					passwordHash,
					avatar: this.generateIcon(email)
				},
				select: {
					id: true,
					email: true,
					name: true
				}
			});
		},

		async deleteUser(userId) {
			return prisma.user.delete({
				where: { id: userId }
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

		async disable2FA(userId) {
			return prisma.user.update ({
				where: { id: userId },
				data: {
					two_fa_enabled: false,
					two_fa_secret: null
				}
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
		},

		async getFriends(id) {
			const u = await prisma.user.findUnique({
				where: { id },
				include: { 
					friends: { 
						select: { 
							id: true, 
							email: true, 
							name: true, 
							avatar: true, 
							human: true 
						} 
					} 
				}
			});
			return u ? u.friends : [];
		},

		async getComputerPlayers(id) {
			const users = await prisma.user.findMany({
				where: { human: false },
				select: { 
					id: true, 
					email: true, 
					name: true, 
					avatar: true, 
					human: true 
				} 
			});
			return users;
		},

		generateIcon(email) {
			const path = `images/avatar/${email}.png`;
			fs.writeFileSync(`/app/public/${path}`, jdenticon.toPng(email, 200));
			return path;
		}
	};
}

module.exports = createUserService;
