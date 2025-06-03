

// const jwt = require('jsonwebtoken');

function createAuthUtils() {
	return {
		// generateToken(payload, expiresIn = '1h') {
		// 	return jwt.sign(payload, jwtSecret, { expiresIn });
		// },

		// verifyTokenMiddleware() {
		// 	return function (request, reply, done) {
		// 		const authHeader = request.headers['authorization'];
		// 		if (!authHeader) return reply.code(401).send({ error: 'Authorization header missing' });

		// 		const token = authHeader.split(' ')[1];
		// 		if (!token) return reply.code(401).send({ error: 'Token missing' });

		// 		try {
		// 			const decoded = fastify.jwt.verify(token, jwtSecret);
		// 			request.user = decoded;
		// 			done();
		// 		} catch {
		// 			reply.code(401).send({ error: 'Invalid or expired token' });
		// 		}
		// 	};
		// },

		verifyTokenMiddleware() {
			return async function (request, reply) {
				try {
					await request.jwtVerify();
				} catch (err) {
					// reply.code(401);.send({ error: err.message || 'Invalid or expired token' });
					reply.code(401);
					reply.sendFile('index.html');
				}
			};
		},

		// verifyJWT(token) {
		// 	return jwt.verify(token, jwtSecret);
		// },

		verifyPassword(password) {
			if (!password || password.length < 6) {
				return { valid: false, error: 'Password must be at least 6 characters' };
			}

			if (!/^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\-]+$/.test(password)) {
				return { valid: false, error: 'Password can only contain letters, numbers and special characters' };
			}

			if (!/[A-Z]/.test(password)) {
				return { valid: false, error: 'Password must contain at least one uppercase letter' };
			}

			if (!/[a-z]/.test(password)) {
				return { valid: false, error: 'Password must contain at least one lowercase letter' };
			}

			if (!/[0-9]/.test(password)) {
				return { valid: false, error: 'Password must contain at least one number' };
			}

			if (!/[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\-]/.test(password)) {
				return { valid: false, error: 'Password must contain at least one special character' };
			}

			return { valid: true };
		},

		verifyEmail(email) {
			if (!email) {
				return { valid: false, error: 'Email is required' };
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return { valid: false, error: 'Invalid email format' };
			}

			return { valid: true };
		},

		verifyUsername(username) {
			if (!username) {
				return { valid: false, error: 'Username is required' };
			}

			if (username.length < 3 || username > 20) {
				return { valid: false, error: 'Username must be between 3 and 20 characters' };
			}

			if (!/^[a-zA-Z0-9_]+$/.test(username)) {
				return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
			}

			const reservedUsernames = ['admin', 'administrator', 'root', 'system', 'moderator'];
			if (reservedUsernames.includes(username.toLowerCase())) {
				return { valid: false, error: 'This username is reserved' };
			}

			return {valid: true };
		}
	};
}

module.exports = createAuthUtils;
