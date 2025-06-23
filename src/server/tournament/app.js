

const fp = require('fastify-plugin');
const tournamentRoutes = require('./routes/tournament.routes');
const createTournamentService = require('./services/tournament.service');
const { play } = require('../games/ws.cjs');

async function tournamentPlugin(fastify, options) {
	const prisma = require('../prisma/prisma.cjs');
	const tournamentService = createTournamentService(prisma);

	await fastify.register(tournamentRoutes, {
		prefix: 'api',
		tournamentService,
		play
	});
}

module.exports = fp(tournamentPlugin);