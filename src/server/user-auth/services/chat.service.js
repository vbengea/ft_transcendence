
function createChatService(prisma) {

	return {
		
		async getNewMessagesCount(uid) {
			return (await prisma.message.findMany({
				where: { receiverId: uid, isRead: false }
			})).length;
		},

		async getNewMessagesCountPerUser(uid) {
			return prisma.message.groupBy({
				by: ['senderId'],
				where: {
					receiverId: uid,
					isRead: false
				},
				_count: {
					_all: true,
				}
			});
		},

		async getNewMessagesPerUser(uid, friendId) {
			return prisma.message.findMany({
				by: ['senderId'],
				where: {
					OR:[
						{ AND: [{ receiverId: uid, senderId: friendId}] },
						{ AND: [{ receiverId: friendId, senderId: uid}] }
					]
				},
				take: 10,
				orderBy: [{
					creationTime: 'asc'
				}]
			});
		},

		async createMessage(senderId, receiverId, text) {
			return prisma.message.create({
				senderId,
				receiverId,
				text
			});
		}
	}

};

module.exports = createChatService;