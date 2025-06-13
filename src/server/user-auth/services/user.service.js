

const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const jdenticon = require("jdenticon");
const fetch = require('node-fetch');
const fs = require("fs");
const Buffer = require('buffer').Buffer 

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
					avatar: await this.generateIcon(email, true),
					human: true
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

		async updatePassword(userId, newPassword) {
			const passwordHash = await bcrypt.hash(newPassword, 10);

			return prisma.user.update({
				where: { id: userId },
				data: { passwordHash }
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
				where: { human: false, id: { NOT: id } },
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

		async generateIcon(email, human) {
			const path = `images/avatar/${email}.png`;
			const file = `/app/public/${path}`;
			if (human) {
				fs.writeFileSync(file, jdenticon.toPng(email, 200));
			} else {
				const blob = await (await fetch(`https://robohash.org/${email}`)).blob();
				let buffer = await blob.arrayBuffer();
				buffer = Buffer.from(buffer);
				fs.createWriteStream(file).write(buffer);
			}
			return path;
		}
	};
}

module.exports = createUserService;
