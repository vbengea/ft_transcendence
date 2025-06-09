

function tournamentRoutes(fastify, options, done) {
	const { tournamentService } = options;

	fastify.post('/tournament', { preHandler: fastify.authenticate }, async ( request, reply) => {
		try {
			const userId = request.user.id;
			const tournamentData = request.body;

			const tournament = await tournamentService.createTournament(
				userId,
				tournamentData.name,
				tournamentData.users,
				tournamentData.rounds,
				tournamentData.gameName
			);

			reply.code(201).send({
				message: 'Tournament created successfully',
				tournamentId: tournament.id
			});
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: 'Failed to create tournament' });
		}
	});

	fastify.get('/tournaments', { preHandler: fastify.authenticate }, async (request, reply) => {
		try {
			const tournaments = await tournamentService.getTournaments();
			reply.send(tournaments);
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: 'Failed to fetch tournaments' });
		}
	});

	done();
}

module.exports = tournamentRoutes;