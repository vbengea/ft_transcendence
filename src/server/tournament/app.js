

const fp = require('fastify-plugin');
const tournamentRoutes = require('./routes/tournament.routes');
const createTournamentService = require('./services/tournament.service');

async function tournamentPlugin(fastify, options) {
	const prisma = require('../prisma/prisma.cjs');
	const tournamentService = createTournamentService(prisma);

	await fastify.register(tournamentRoutes, {
		prefix: 'api',
		tournamentService
	});
}

module.exports = fp(tournamentPlugin);