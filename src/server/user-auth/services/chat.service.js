
function createChatService(prisma) {

	return {
		
		async getNewMessagesCount(uid) {
			return (await prisma.message.findMany({
				where: { receiverId: uid, isRead: false }
			})).length;
		},

		async getNewMessagesCountPerUser(uid) {
			const messages = await prisma.message.groupBy({
				by: ['senderId'],
				where: {
					receiverId: uid,
					isRead: false
				},
				_count: {
					_all: true,
				}
			});

			const blocked = (await this.getBlockedUsers(uid)).map(r => r.id);

			const users = await prisma.user.findMany({
				where : {
					human: true
				},
				orderBy: {
					name: 'asc'
				}
			});

			for (let u of users) {
				u.count = 0;
				for (let m of messages) {
					if (u.id === m.senderId) {
						u.count = m._count._all;
						break;
					}
				}

				u.blocked = false;
				for (let blockedId of blocked) {
					if (u.id === blockedId) {
						u.blocked = true;
						break;
					}
				}
			}

			users.sort((a, b) => {
				return b.count - a.count;
			});

			return users;
		},

		async getNewMessagesPerUser(uid, friendId) {
			const messages = await prisma.message.findMany({
				where: {
					OR: [
						{ AND: [{ receiverId: uid, senderId: friendId}] },
						{ AND: [{ receiverId: friendId, senderId: uid}] }
					]
				},
				include: {
					sender: true
				},
				orderBy: [{
					creationTime: 'asc'
				}]
			});

			const ids = messages.map(r => r.id);

			if (messages.length) {
				await prisma.message.updateMany({
					where: {
						id: { in: ids }
					},
					data: {
						isRead: true
					}
				});
			}

			return messages;
		},

		async createMessage(senderId, receiverId, text, isRead) {
			return prisma.message.create({
				data: {
					senderId,
					receiverId,
					text,
					isRead
				}
			});
		},

		async getBlockedUsers(id) {
			const user = await prisma.user.findUnique({
				where: { id },
				include: {
					blockedUsers: {
						select: {
							id: true
						}
					}
				}
			});

			return user.blockedUsers;
		},

		async blockUser(userId, blockedUserId) {
			return await prisma.user.update({
				where: { id: userId },
				data: {
					blockedUsers: {
						connect: [{ id: blockedUserId }]
					}
				}
			})
		}
	}

};

module.exports = createChatService;