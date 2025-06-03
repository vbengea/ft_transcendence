require('dotenv').config();

const initDb = require('../db/db');
const createUserService = require('./services/user.service');
const createAuthUtils = require('./utils/auth');
const authRoutes = require('./routes/auth.routes');


// const authUtils = createAuthUtils(process.env.JWT_SECRET);

// const fastify = require('fastify')();
// fastify.register(require('@fastify/cors'), { origin: true });
// fastify.register(require('@fastify/formbody'));

// async function startServer() {
// 	try {
// 		const db = await initDb();
// 		const userService = createUserService(db);
		
// 		fastify.register(require('./routes/auth.routes'), {
// 			userService,
// 			jwtSecret: process.env.JWT_SECRET,
// 			authUtils
// 		});
		
// 		fastify.listen({port: 3000}, (err, address) => {
// 			if (err) {
// 				console.error(err);
// 				process.exit(1);
// 		}
// 		console.log(`Server listening at ${address}`);
// 		});
// 	} catch (err) {
// 		console.error('Failed to start server:', err);
// 		process.exit(1);
// 	}
// }

// startServer();

async function authPlugin(fastify, options) {

	fastify.register(require('@fastify/cors'), { origin: true, credentials: true });
	fastify.register(require('@fastify/formbody'));

	const db = await initDb();
	const userService = createUserService(db);

	fastify.register(authRoutes, {
		userService,
		authUtils: options.authUtils
	});
}

module.exports = authPlugin;
