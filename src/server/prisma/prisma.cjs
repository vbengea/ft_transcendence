const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fill() {
	await prisma.game.create({ data: { description: 'Pong', name: 'pont' } })
	await prisma.game.create({ data: { description: 'Tic tac toe', name: 'tictactoe' } })
	await prisma.user.create({ data: { email: 'juaflore@gmail.com', name: 'Juan Daniel Flores', password: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC" } })
}

fill();

module.exports = prisma;