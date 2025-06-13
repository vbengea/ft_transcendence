const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const utils = require('../user-auth/services/user.service')(prisma)
const DEFAULT_PASSWORD = "1234";

async function fill() {
    await prisma.game.create({ data: { description: "Pong", name: "pong" } });
    await prisma.game.create({ data: { description: "Tic tac toe", name: "tictactoe" } });

	// Bots .............................................................................

	await utils.createUser("alincoln@gmail.com", "Abraham Lincoln", false, DEFAULT_PASSWORD);
	await utils.createUser("gwashing@gmail.com", "George Washington", false, DEFAULT_PASSWORD);
	await utils.createUser("tjefferson@gmail.com", "Thomas Jefferson", false, DEFAULT_PASSWORD);
	await utils.createUser("ccolon@gmail.com", "Cristobal Colón", false, DEFAULT_PASSWORD);

	await utils.createUser("florca@gmail.com", "Federico García Lorca", false, DEFAULT_PASSWORD);
	await utils.createUser("avargas@gmail.com", "Alan Vargas", false, DEFAULT_PASSWORD);
	await utils.createUser("jausten@gmail.com", "Jane Austen", false, DEFAULT_PASSWORD);
	await utils.createUser("psmith@gmail.com", "Paul Smith", false, DEFAULT_PASSWORD);

	await utils.createUser("jsiemens@gmail.com", "John Siemens", false, DEFAULT_PASSWORD);
	await utils.createUser("jsolomon@gmail.com", "Jake Solomon", false, DEFAULT_PASSWORD);
	await utils.createUser("ysoon@gmail.com", "Young Soon", false, DEFAULT_PASSWORD);
	await utils.createUser("cswam@gmail.com", "Chang Swam", false, DEFAULT_PASSWORD);

	// Humans ...........................................................................

	await utils.createUser("edgar@gmail.com", "Edgar Allan Poe", true, DEFAULT_PASSWORD);
	await utils.createUser("tolstoi@gmail.com", "Léon Tolstói", true, DEFAULT_PASSWORD);
	await utils.createUser("unamuno@gmail.com", "Miguel de Unamuno", true, DEFAULT_PASSWORD);
	await utils.createUser("juaflore@gmail.com", "Juan Daniel Flores", true, DEFAULT_PASSWORD);
}

fill();

module.exports = prisma;