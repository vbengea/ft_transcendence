
const { createUser, login, logout } = require('./controller.cjs')

async function userRoutes(app) {
	app.get('/', { preHandler: [app.authenticate] }, (req, reply) => { return reply.code(200).send(req.user); })
	app.post('/register', {}, createUser)
	app.post('/login', {}, login)
	app.delete('/logout', { preHandler: [app.authenticate] }, logout)
}

module.exports = userRoutes;