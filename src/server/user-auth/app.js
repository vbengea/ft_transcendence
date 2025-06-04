require('dotenv').config();

const fp = require('fastify-plugin');
const authRoutes = require('./routes/auth.routes');
const createUserService = require('./services/user.service');

async function authPlugin(fastify, options) {
	const prisma = require('../prisma/prisma.cjs');

	const userService = createUserService(prisma);
	const authUtils = options.authUtils || require('./utils/auth')();

	await fastify.register(authRoutes, {
		prefix: 'auth',
		userService,
		jwtSecret: process.env.JWT_SECRET,
		authUtils
	});
}

module.exports = fp(authPlugin);
