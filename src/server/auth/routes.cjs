
const { createUser, login, logout, getGames } = require('./controller.cjs')

async function userRoutes(app) {
	app.get('/', { preHandler: [app.authenticate] }, getGames)
	app.post('/register', {}, createUser)
	app.post('/login', {}, login)
	app.delete('/logout', { preHandler: [app.authenticate] }, logout)
}

module.exports = userRoutes;