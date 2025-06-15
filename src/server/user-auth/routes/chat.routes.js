

function chatRoutes(fastify, options, done) {
	const { chatService, userService } = options;
	const verifyToken = fastify.authenticate;

	fastify.get('/new_message_count', { preHandler: verifyToken }, async (request, reply) => {
		try {
			const count = await chatService.getNewMessagesCount(request.user.id);
			reply.send(count);
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: 'Failed to fetch message count' });
		}
	});

	fastify.get('/new_message_count_per_user', { preHandler: verifyToken }, async (request, reply) => {
		try {
			const raw = await chatService.getNewMessagesCountPerUser(request.user.id);
			reply.send(raw);
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: 'Failed to fetch message count per user' });
		}
	});

	fastify.get('/messages/:friend_id', { preHandler: verifyToken }, async (request, reply) => {
		try {
			const raw = await chatService.getNewMessagesPerUser(request.user.id, request.params.friend_id);
			reply.send(raw);
		} catch (err) {
			fastify.log.error(err);
			console.log(err)
			reply.code(500).send({ error: 'Failed to fetch message count per user' });
		}
	});

	done();
}

module.exports = chatRoutes;