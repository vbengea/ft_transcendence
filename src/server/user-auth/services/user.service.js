

const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const jdenticon = require("jdenticon");
const fetch = require('node-fetch');
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

		async createUser(email, name, human, plainPassword, anonymous = false, lang = 'en_EN') {
			const passwordHash = await bcrypt.hash(plainPassword, 10);
			let bots = new Set();
			if (human) {
				const comp = await this.getComputerPlayers();
				while (comp.length >= 3 && bots.size < 3) {
					const i = Math.floor(Math.random() * comp.length);
					bots.add(comp[i]);
					comp.splice(i, 1);
				}
			}

			bots = Array.from(bots);

			const data = {
				email,
				name,
				passwordHash,
				avatar: await this.generateIcon(email, human, anonymous),
				human,
				anonymous,
				friends: bots.length ? {
					connect: bots.map(({ id }) => { return { id }; })
				} : {}
			};

			if (anonymous)
				data.id = email;

			if (lang)
				data.lang = lang;

			return prisma.user.create({
				data,
				select: {
					id: true,
					email: true,
					name: true
				}
			});
		},

		async deleteUser(userId) {
			await prisma.friendRequest.deleteMany({
				where: {
					OR: [
						{ senderId: userId },
						{ receiverId: userId }
					]
				}
			});

			await prisma.message.deleteMany({
				where: {
					OR: [
						{ senderId: userId },
						{ receiverId: userId }
					]
				}
			});

			await prisma.match.updateMany({
				where: { user1Id: userId },
				data: { user1Id: null }
			});

			await prisma.match.updateMany({
				where: { user2Id: userId },
				data: { user2Id: null }
			});

			await prisma.match.updateMany({
				where: { user3Id: userId },
				data: { user3Id: null }
			});

			await prisma.match.updateMany({
				where: { user4Id: userId },
				data: { user4Id: null }
			});

			const userTournaments = await prisma.tournament.findMany({
				where: { organizerId: userId },
				include: { rounds: true }
			});

			for (const tournament of userTournaments) {
				for (const round of tournament.rounds) {
					await prisma.match.deleteMany({
						where: { roundId: round.id }
					});
				}

				await prisma.round.deleteMany({
					where: { tournamentId: tournament.id }
				});

				await prisma.tournament.delete({
					where: { id: tournament.id }
				});
			}

			await prisma.user.update({
				where: { id: userId },
				data: {
					friends: { set: [] },
					friendOf: { set: [] },
					blockedUsers: { set: [] }
				}
			});
			
			return prisma.user.delete({
				where: { id: userId }
			});
		},

		async userLangUpdate(userId, lang) {
			await prisma.user.update({
				where: { id: userId },
				data: { lang }
			});
		},

		async userExists(email, name) {
			const count = await prisma.user.count({
				where: {
					OR: [
						{ email },
						{ name }
					],
					AND: { anonymous: false }
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

			let bots = new Set();
			const comp = await this.getComputerPlayers();
			while (comp.length >= 3 && bots.size < 3) {
				const i = Math.floor(Math.random() * comp.length);
				bots.add(comp[i]);
				comp.splice(i, 1);
			}


			bots = Array.from(bots);

			const localAvatar = await this.downloadAndSaveAvatar(email, avatar);

			return prisma.user.create({
				data: {
					email,
					name: name,
					googleId: google_id,
					avatar: localAvatar,
					human: true,
					anonymous: false,
					friends: bots.length ? {
						connect: bots.map(({ id }) => { return { id }; })
					} : {}
				},
				select: {
					id: true,
					email: true,
					name: true
				}
			});
		},

		async downloadAndSaveAvatar(email, avatarUrl) {
			const path = `images/avatar/${email}.png`;
			const filePath = `${process.cwd()}/public/${path}`;
			try {
				const response = await fetch(avatarUrl);
				const buffer = await response.arrayBuffer();
				await fs.promises.writeFile(filePath, Buffer.from(buffer));
				return path;
			} catch (err) {
				console.error('Error downloading avatar:', error);
				return this.generateIcon(email, true, false);
			}
		},

		async getFriends(id, human) {
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
					},
					friendOf: { 
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

			if (!u) {
				return [];
			}

			const uniqueFriends = new Map();

			u.friends.forEach(friend => {
				uniqueFriends.set(friend.id, friend);
			});

			u.friendOf.forEach(friend => {
				uniqueFriends.set(friend.id, friend);
			});

			let finalUsers = Array.from(uniqueFriends.values());

			if (human) {
				finalUsers = finalUsers.filter(u => u.human);
			}

			return finalUsers;
		},

		async getComputerPlayers() {
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

		async generateIcon(email, human, anonymous) {
			const path = `images/avatar/${email}.png`;
			const file = `${process.cwd()}/public/${path}`;
			if (human && !anonymous)
				fs.writeFileSync(file, jdenticon.toPng(email, 200));
			return path;
		},

		async getFriendRequests(userId) {
			return prisma.friendRequest.findMany({
				where: { receiverId: userId, status: 'PENDING' },
				include: {
					sender: {
						select: {
							id : true,
							email: true,
							name: true,
							avatar: true
						}
					}
				}
			});
		},

		async sendFriendRequest(senderId, receiverId) {
			const [sender, receiver] = await Promise.all([
				prisma.user.findUnique({ where: { id: senderId } }),
				prisma.user.findUnique({ where: { id: receiverId } })
			]);

			if (!sender || !receiver) {
				throw new Error('User not found');
			}

			const existingFriendship = await prisma.user.findFirst({
				where: {
					id: senderId,
					friends: { some: { id: receiverId } }
				}
			});

			if (existingFriendship) {
				throw new Error('You are already friends with this user');
			}

			const existingRequest = await prisma.friendRequest.findFirst({
				where: {
					OR: [
						{ senderId, receiverId },
						{ senderId: receiverId, receiverId: senderId}
					]
				}
			});

			if (existingRequest) {
				if (existingRequest.status === 'REJECTED' || existingRequest.status === 'REMOVED') {
					if (existingRequest.senderId !== senderId) {
						await prisma.friendRequest.delete({
							where: { id: existingRequest.id }
						});

						return prisma.friendRequest.create({
							data: {
								senderId,
								receiverId,
								status: 'PENDING'
							}
						});
					} else {
						return prisma.friendRequest.update({
							where: { id: existingRequest.id },
							data: { status: 'PENDING' }
						});
					}
				}

				if (existingRequest.status === 'PENDING') {
					throw new Error('A friend request already exists between these users');
				}

				if (existingRequest.status === 'ACCEPTED') {
					throw new Error('You already have an accepted friend request with this user');
				}
			}

			return prisma.friendRequest.create({
				data: {
					senderId,
					receiverId,
					status: 'PENDING'
				}
			});
		},

		async acceptFriendRequest(requestId, userId) {
			const request = await prisma.friendRequest.findUnique({
				where: { id: requestId }
			});

			if (!request || request.receiverId !== userId) {
				throw new Error('Friend request not found or you are not authorized to accept it');
			}

			await prisma.friendRequest.update({
				where: { id: requestId },
				data: { status: 'ACCEPTED' }
			});

			await prisma.user.update({
				where: { id: userId },
				data: {
					friends: {
						connect: { id: request.senderId }
					}
				}
			});

			return prisma.user.update({
				where: { id: request.senderId },
				data: {
					friends: {
						connect: { id: userId }
					}
				}
			});
		},

		async rejectFriendRequest(requestId, userId) {
			const request = await prisma.friendRequest.findUnique({
				where: { id: requestId }
			});

			if (!request || request.receiverId !== userId) {
				throw new Error('Friend request not found or you are not authorized to reject it');
			}

			return prisma.friendRequest.update({
				where: { id: requestId },
				data: { status: 'REJECTED' }
			});
		},

		async searchUsers(query, currentUserId) {
			const users = await prisma.user.findMany({
				where: {
					AND: [
						{ id: { not: currentUserId } },
						{ human: true },
						{ anonymous: false },
						{
							OR: [
								{ name: { contains: query } },
								{ email: { contains: query } }
							]
						}
					]
				},
				select: {
					id: true,
					email: true,
					name: true,
					avatar: true
				}
			});

			const usersWithStatus = await Promise.all(users.map(async (user) => {
				const areFriends = await prisma.user.findFirst({
					where: {
						id: currentUserId,
						friends: { some: { id: user.id } }
					}
				});

				if (areFriends) {
					return { ...user, friendStatus: 'friends' };
				}

				const pendingRequest = await prisma.friendRequest.findFirst({
					where: {
						OR: [
							{ senderId: currentUserId, receiverId: user.id },
							{ senderId: user.id, receiverId: currentUserId }
						],
						status: 'PENDING'
					}
				});

				if (pendingRequest) {
					return { ...user, friendStatus: 'pending' };
				}

				return { ...user, friendStatus: 'none' };
			}));

			return usersWithStatus;
		},

		async removeFriend(userId, friendId) {
			const [user, friend]  = await Promise.all([
				prisma.user.findUnique({ where: { id: userId } }),
				prisma.user.findUnique({ where: { id: friendId } })
			]);

			if (!user || !friend) {
				throw new Error('User or friend not found');
			}

			const areFriends = await prisma.user.findFirst({
				where: {
					OR: [
						{
							id: userId,
							friends: { some: { id: friendId } }
						},
						{
							id: userId,
							friendOf: { some: { id: friendId } }
						}
					]
				}
			});

			if (!areFriends) {
				throw new Error('You are not friends with this user');
			}

			await prisma.user.update({
				where: { id: userId },
				data: {
					friends: {
						disconnect: { id: friendId }
					}
				}
			});

			await prisma.user.update({
				where: { id: friendId },
				data: {
					friends: {
						disconnect: { id: userId }
					}
				}
			});

			const existingRequest = await prisma.friendRequest.findFirst({
				where: {
					OR: [
						{ senderId: userId, receiverId: friendId },
						{ senderId: friendId, receiverId: userId }
					]
				}
			});

			if (existingRequest) {
				await prisma.friendRequest.update({
					where: { id: existingRequest.id },
					data: { status: 'REMOVED' }
				});
			}

			return { message: 'Friend removed successfully' };
		},

		async updateUsername(userId, name) {
			return prisma.user.update({
				where: { id: userId },
				data: { name }
			});
		},

		async usernameExists(name) {
			const user = await prisma.user.findFirst({
				where: { name }
			});
			return !!user;
		}
	};
}

module.exports = createUserService;
