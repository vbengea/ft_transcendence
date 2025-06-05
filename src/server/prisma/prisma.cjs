const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fill() {
	await prisma.game.create({ data: { description: 'Pong', name: 'pont' } })
	await prisma.game.create({ data: { description: 'Tic tac toe', name: 'tictactoe' } })

	// Humans
	await prisma.user.create({ data: { email: 'juaflore@gmail.com', name: 'Juan Daniel Flores', passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC" } })
	
	// Bots
	await prisma.user.create({ data: { email: 'edgar@gmail.com', name: 'Edgar Allan Poe', passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC", human: false } })
	await prisma.user.create({ data: { email: 'tolstoi@gmail.com', name: 'Léon Tolstói', passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC", human: false } })
	await prisma.user.create({ data: { email: 'unamuno@gmail.com', name: 'Miguel de Unamuno', passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC", human: false } })
}

fill();

module.exports = prisma;