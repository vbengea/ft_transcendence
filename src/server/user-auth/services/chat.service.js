
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

			const users = await prisma.user.findMany({
				where : {
					human: true
				},
				orderBy: {
					name: 'asc'
				}
			});

			if (messages.length){
				for (let u of users) {
					for (let m of messages) {
						if (u.id === m.senderId) {
							u.count = m._count._all;
						}
					}
				}
			}

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
				take: 10,
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

		async createMessage(senderId, receiverId, text) {
			return prisma.message.create({
				data: {
					senderId,
					receiverId,
					text
				}
			});
		}
	}

};

module.exports = createChatService;