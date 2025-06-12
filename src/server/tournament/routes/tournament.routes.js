

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
				tournamentData.gameName,
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

	fastify.get('/tournaments/current_match', { preHandler: fastify.authenticate }, async (request, reply) => {
		try {
			const uid = request.user.id;
			const match = matches = await tournamentService.getCurrentTournamentMatchByUserId(uid);
			const currentMatch = match.length ? match[0] : null;
			reply.send(currentMatch);
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: 'Failed to fetch current match' });
		}
	});

	fastify.get('/tournament/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
		try {
			const tournament = await tournamentService.getTournamentById(request.params.id);
			reply.send(tournament);
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: 'Failed to fetch tournament' });
		}
	});

	fastify.delete('/tournament/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
		try {
			const tournamentId = request.params.id;
			const userId = request.user.id;

			const tournament = await tournamentService.getTournamentById(tournamentId);

			if (!tournament) {
				return reply.code(404).send({ error: 'Tournament not found' });
			}

			if (tournament.organizerId !== userId) {
				return reply.code(403).send({ error: 'You are not authorized to delete this tournament' });
			}

			await tournamentService.deleteTournament(tournamentId);

			reply.code(200).send({ message: 'Tournament deleted successfully' });
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: 'Failed to delete tournament' });
		}
	});

	fastify.get('/matches', { preHandler: fastify.authenticate }, async (request, reply) => {
		try {
			const matches = await tournamentService.getMatchesByUserId(request.user.id);
			reply.send(matches);
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: 'Failed to fetch matches' });
		}
	});

	done();
}

module.exports = tournamentRoutes;