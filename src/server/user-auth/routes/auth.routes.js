
const { errorCodes } = require('fastify');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

function authRoutes(fastify, options, done) {
	const userService = options.userService;
	const JWT_SECRET = options.jwtSecret;
	const authUtils = options.authUtils;

	// const verifyToken = authUtils.verifyTokenMiddleware();
	const verifyToken = fastify.authenticate;

	fastify.post('/register', async (request, reply) => {
		const { email, name, password } = request.body;
		if (!email || !name || !password) return reply.code(400).send({ error: 'Missing fields' });

		if (email.length > 100) {
			return reply.code(400).send({ error: 'Email exceeds maximum length of 100 characters' });
		}

		if (name.length > 50) {
			return reply.code(400).send({ error: 'Name exceeds maximum length of 50 characters' });
		}

		if (password.length > 72) { // Bcrypt limit
			return reply.code(400).send({ error: 'Password exceeds maximum length of 72 characters' });
		}


		const emailValidation = authUtils.verifyEmail(email);
		if (!emailValidation.valid) {
			return reply.code(400).send({ error: emailValidation.error });
		}

		const nameValidation = authUtils.verifyUsername(name);
		if (!nameValidation.valid) {
			return reply.code(400).send({ error: nameValidation.error });
		}

		const validPassword = authUtils.verifyPassword(password);
		if (!validPassword.valid) {
			return reply.code(400).send({ error: validPassword.error });
		}

		const exists = await userService.userExists(email, name);
		if (exists) return reply.code(409).send({ error: 'Email or name already taken' });

		const newUser = await userService.createUser(email, name, true, password);
		reply.send({ message: 'User registered', user: newUser });
	});

	fastify.post('/login', async (request, reply) => {
		const { email, password } = request.body;
		if (!email || !password) {
			return reply.code(400).send({ error: 'Missing fields' });
		}

		if (email.length > 100) {
			return reply.code(400).send({ error: 'Email exceeds maximum length of 100 characters' });
		}

		if (password.length > 72) { // Bcrypt limit
			return reply.code(400).send({ error: 'Password exceeds maximum length of 72 characters' });
		}

		const user = await userService.getUserByEmail(email);
		if (!user) {
			return reply.code(401).send({ error: 'Invalid credentials' });
		}

		const valid = await userService.validatePassword(password, user.passwordHash);
		if (!valid) {
			return reply.code(401).send({ error: 'Invalid credentials' });
		}

		if (user.two_fa_enabled) {
			const tempToken = fastify.jwt.sign({ id: user.id, name: user.name, twoFA: true }, JWT_SECRET, { expiresIn: '5m'});
			return reply.send({ message: '2FA required', tempToken});
		}

		const token = fastify.jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });

		reply.setCookie('access_token', token, {
			path: '/',
			secure: true,
			httpOnly: true,
			sameSite: 'strict'
		});

		reply.send({ message: 'Login successful', token, user: {id : user.id, email: user.email, name: user.name, avatar: user.avatar } });
	});

	fastify.post('/login/2fa', async (request, reply) => {
		const { token, code } = request.body;
		if (!token || !code) return reply.code(400).send({ error: 'Missing token or code' });

		try {
			const decoded = fastify.jwt.verify(token, JWT_SECRET);
			if (!decoded.twoFA) {
				return reply.code(401).send({ error: 'Invalid token type' });
			}

			const user = await userService.getUserById(decoded.id);
			if (!user) {
				return reply.code(404).send({ error: 'User not found' });
			}

			const valid = userService.verify2FACode(user.two_fa_secret, code);
			if (!valid) {
				return reply.code(401).send({ error: 'Invalid 2FA code' });
			}

			const realToken = fastify.jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });

			reply.setCookie('access_token', realToken, {
				path: '/',
				secure: true,
				httpOnly: true,
				sameSite: 'strict'
			});

			reply.send({ message: '2FA login successful', token: realToken, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
		} catch {
			return reply.code(401).send({ error: 'Invalid or expired token' });
		}
	});

	fastify.get('/me', { preHandler: verifyToken }, async (request, reply) => {
		reply.send({ id: request.user.id, name: request.user.name });
	});

	fastify.get('/you/:id', { preHandler: verifyToken }, async (request, reply) => {
		const user = await userService.getUserById(request.params.id);
		reply.send(user);
	});

	fastify.get('/2fa/setup', { preHandler: verifyToken }, async (request, reply) => {
		const user = await userService.getUserById(request.user.id);
		if (user && user.two_fa_enabled) {
			return reply.code(400).send({ error: '2FA is already enabled for this account' });
		}

		const secret = require('speakeasy').generateSecret({ name: `Transcendence (${request.user.name})` });
		await userService.save2FASecret(request.user.id, secret.base32);
		const qr = await qrcode.toDataURL(secret.otpauth_url);
		reply.send({ qrcode: qr, manualCode: secret.base32 });
	});

	fastify.delete('/2fa', { preHandler: verifyToken }, async (request, reply) => {
		try {
			const user = await userService.getUserById(request.user.id);
			if (!user || !user.two_fa_enabled) {
				return reply.code(400).send({ error: '2FA is not enabled for this account' });
			}

			await userService.disable2FA(user.id);
			reply.send({ message: '2FA disabled successfully' });
		} catch (err) {
			reply.code(500).send({ error: 'Failed to disable 2FA' });
		}
	});

	fastify.post('/2fa/verify', { preHandler: verifyToken }, async (request, reply) => {
		const { token: code } = request.body;
		const user = await userService.getUserById(request.user.id);
		if (!user || !user.two_fa_secret) {
			return reply.code(400).send({ error: '2FA not set up' });
		}

		const valid = userService.verify2FACode(user.two_fa_secret, code);
		if (!valid) {
			return reply.code(401).send({ error: 'Invalid 2FA code' });
		}

		await userService.enable2FA(user.id);
		reply.send({ message: '2FA enabled successfully' });
	});

	fastify.post('/google', async (request, reply) => {
		const { id_token } = request.body;
		if (!id_token) {
				return reply.code(400).send({ error: 'Missing id_token' });
		}

		try {
			const ticket = await client.verifyIdToken({
				idToken: id_token,
				audience: process.env.GOOGLE_CLIENT_ID,
			});

			const payload = ticket.getPayload();
			const google_id = payload.sub;
			const email = payload.email;
			const name = payload.name;
			const avatar = payload.picture;

			let user = await userService.getByGoogleId(google_id);
			if (!user) {
				user = await userService.createGoogleUser({ google_id, email, name, avatar });
			}

			if (user.two_fa_enabled) {
				const tempToken = fastify.jwt.sign(
					{ id: user.id, name: user.name, twoFA: true },
					JWT_SECRET,
					{ expiresIn: '5m' }
				);
				return reply.send({ message: '2FA required', tempToken });
			}

			const token = fastify.jwt.sign(
				{ id: user.id, name: user.name },
				JWT_SECRET,
				{ expiresIn: '1h' }
			);

			reply.setCookie('access_token', token, {
				path: '/',
				secure: true,
				httpOnly: true,
				sameSite: 'strict'
			});

			reply.send({
				message: 'Google login successful',
				token,
				user: { id: user.id, email: user.email, name: user.name }
			});
		} catch (err) {
			fastify.log.error(err);
			reply.code(401).send({ error: 'Google authentification failed' });
		}
	});

	fastify.delete('/logout', async (request, reply) => {
		reply.clearCookie('access_token', {
			path: '/',
			secure: true,
			httpOnly: true,
			sameSite: 'strict'
		});
		reply.send({ message: 'Logged out successfully' });
	})

	fastify.get('/status', { preHandler: fastify.authenticate }, async (request, reply) => {
		const user = await userService.getUserById(request.user.id);
		reply.send({ 
			authenticated: !!user,
			user: {
				...user,
				two_fa_enabled: user ? user.two_fa_enabled : false
			}
		});
	});

	fastify.delete('/account', { preHandler: verifyToken }, async (request, reply) => {
		try {
			const userId = request.user.id;

			await userService.deleteUser(userId);

			reply.clearCookie('access_token', {
				path: '/',
				secure: true,
				httpOnly: true,
				sameSite: 'strict'
			});

			reply.send({ message: 'Account deleted successfully' });
		} catch (err) {
			console.error('Error deleting account:', err);
			reply.code(500).send({ error: 'Failed to delete account' });
		}
	});

	fastify.get('/config', async (request, reply) => {
		reply.send({
			googleClientId: process.env.GOOGLE_CLIENT_ID
		});
	});

	fastify.get('/friends/:uid', { preHandler: verifyToken }, async (request, reply) => {
		try {
			const userId = request.params.uid;
			const friends = await userService.getFriends(userId);
			reply.send(friends);
		} catch (err) {
			console.log(err);
		}
	});

	fastify.get('/computer', { preHandler: verifyToken }, async (request, reply) => {
		try {
			const friends = await userService.getComputerPlayers();
			reply.send(friends);
		} catch (err) {
			console.log(err);
		}
	});

	fastify.post('/avatar', { preHandler: verifyToken }, async (request, reply) => {
		try {
			const userId = request.user.id;
			const data = await request.file();

			if (!data) {
				return reply.code(400).send({ message: 'No file uploaded' });
			}

			if (!data.mimetype.startsWith('image/')) {
				return reply.code(400).send({ message: 'Only image files are allowed' });
			}

			const user = await userService.getUserById(userId);
			if (!user) {
				return reply.code(404).send({ message: 'User not found' });
			}

			const path = `images/avatar/${user.email}.png`;
			const filePath = `/app/public/${path}`;

			await new Promise((resolve, reject) => {
				const fileStream = fs.createWriteStream(filePath);
				data.file.pipe(fileStream);
				fileStream.on('finish', resolve);
				fileStream.on('error', reject);
			});

			return reply.send({
				message: 'Avatar updated successfully',
				avatar: path
			});
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ message: 'Failed to update avatar' });
		}
	});

	fastify.put('/password', { preHandler: verifyToken }, async (request, reply) => {
		const { currentPassword, newPassword } = request.body;

		if (!currentPassword || !newPassword) {
			return reply.code(400).send({ error: 'Missing required fields' });
		}

		const passwordValidation = authUtils.verifyPassword(newPassword);
		if (!passwordValidation.valid) {
			return reply.code(400).send({ error: passwordValidation.error });
		}

		try {
			const user = await userService.getUserById(request.user.id);

			const isValid = await userService.validatePassword(currentPassword, user.passwordHash);
			if (!isValid) {
				return reply.code(401).send({ error: 'Current password is incorrect' });
			}

			await userService.updatePassword(user.id, newPassword);

			reply.send({ message: 'Passowrd updated successfully' });
		} catch (err) {
			console.error('Passowrd update error:', err);
			reply.code(500).send({ error: 'Failed to update password' });
		}
	});

	fastify.get('/friend-requests', { preHandler: verifyToken }, async (request, reply) => {
		try {
			const requests = await userService.getFriendRequests(request.user.id);
			reply.send(requests);
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: 'Failed to get friend requests' });
		}
	});

	fastify.post('/friend-requests', { preHandler: verifyToken }, async (request, reply) => {
		const { receiverId } = request.body;
		if (!receiverId) {
			return reply.code(400).send({ error: 'Missing receiverId' });
		}

		try {
			await userService.sendFriendRequest(request.user.id, receiverId);
			reply.send({ message: 'Friend request sent successfully' });
		} catch (err) {
			fastify.log.error(err);
			if (err.message.includes('already')) {
				return reply.code(400).send({ error: err.message });
			}
			reply.code(500).send({ error: 'Failed to send friend request' });
		}
	});

	fastify.post('/friend-requests/:id/accept', { preHandler: verifyToken }, async (request, reply) => {
		try {
			await userService.acceptFriendRequest(request.params.id, request.user.id);
			reply.send({ message: 'Friend request accepted' });
		} catch (err) {
			fastify.log.error(err);
			if (err.message.includes('not found') || err.message.includes('not authorized')) {
				return reply.code(404).send({ error: err.message });
			}
			reply.code(500).send({ error: 'Failed to accept friend request' });
		}
	});

	fastify.post('/friend-requests/:id/reject', { preHandler: verifyToken }, async (request, reply) => {
		try {
			await userService.rejectFriendRequest(request.params.id, request.user.id);
			reply.send({ message: 'Friend request rejected' });
		} catch (err) {
			fastify.log.error(err);
			if (err.message.includes('not found') || err.message.includes('not authorized')) {
				return reply.code(404).send({ error: err.message });
			}
			reply.code(500).send({ error: 'Failed to reject friend request' });
		}
	});

	fastify.get('/users/search', { preHandler: verifyToken }, async (request, reply) => {
		const { q } = request.query;
		if (!q || q.length < 2) {
			return reply.code(400).send({ error: 'Search query must be at least 2 characters' });
		}

		try {
			const users = await userService.searchUsers(q, request.user.id);
			reply.send(users);
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: 'Failed to search users' });
		}
	});

	fastify.delete('/friends/:id', { preHandler: verifyToken }, async (request, reply) => {
		try {
			const userId = request.user.id;
			const friendId = request.params.id;

			await userService.removeFriend(userId, friendId);
			reply.send({ message: 'Friend removed successfully' });
		} catch (err) {
			fastify.log.error(err);
			if (err.message.includes('not found')) {
				return reply.code(404).send({ error: err.message });
			}
			reply.code(500).send({ error: 'Failed to remove friend' });
		}
	});

	done();
}

module.exports = authRoutes;
