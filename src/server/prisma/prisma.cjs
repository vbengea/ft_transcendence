const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const utils = require('../user-auth/services/user.service')()

async function fill() {
	const size = 200;

    await prisma.game.create({ data: { description: "Pong", name: "pong" } });
    await prisma.game.create({
        data: { description: "Tic tac toe", name: "tictactoe" },
    });

    // Bots .............................................................................

    const c1 = await prisma.user.create({
        data: {
            email: "edgar@gmail.com",
            name: "Edgar Allan Poe",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("edgar@gmail.com", true),
            human: true,
        },
    });
    const c2 = await prisma.user.create({
        data: {
            email: "tolstoi@gmail.com",
            name: "Léon Tolstói",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("tolstoi@gmail.com", true),
            human: true,
        },
    });
    const c3 = await prisma.user.create({
        data: {
            email: "unamuno@gmail.com",
            name: "Miguel de Unamuno",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("unamuno@gmail.com", true),
            human: true,
        },
    });
    const c4 = await prisma.user.create({
        data: {
            email: "alincoln@gmail.com",
            name: "Abraham Lincoln",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("alincoln@gmail.com", false),
            human: false,
        },
    });
    const c5 = await prisma.user.create({
        data: {
            email: "gwashing@gmail.com",
            name: "George Washington",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("gwashing@gmail.com", false),
            human: false,
        },
    });
    const c6 = await prisma.user.create({
        data: {
            email: "tjefferson@gmail.com",
            name: "Thomas Jefferson",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("tjefferson@gmail.com", false),
            human: false,
        },
    });
    const c7 = await prisma.user.create({
        data: {
            email: "ccolon@gmail.com",
            name: "Cristobal Colón",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("ccolon@gmail.com", false),
            human: false,
        },
    });
    const c8 = await prisma.user.create({
        data: {
            email: "florca@gmail.com",
            name: "Federico García Lorca",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("florca@gmail.com", false),
            human: false,
        },
    });
    const c9 = await prisma.user.create({
        data: {
            email: "avargas@gmail.com",
            name: "Alan Vargas",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("avargas@gmail.com", false),
            human: false,
        },
    });
    const c10 = await prisma.user.create({
        data: {
            email: "jausten@gmail.com",
            name: "Jane Austen",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("jausten@gmail.com", false),
            human: false,
        },
    });
    const c11 = await prisma.user.create({
        data: {
            email: "psmith@gmail.com",
            name: "Paul Smith",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("psmith@gmail.com", false),
            human: false,
        },
    });
    const c12 = await prisma.user.create({
        data: {
            email: "jsiemens@gmail.com",
            name: "John Siemens",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("jsiemens@gmail.com", false),
            human: false,
        },
    });
    const c13 = await prisma.user.create({
        data: {
            email: "jsolomon@gmail.com",
            name: "Jake Solomon",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("jsolomon@gmail.com", false),
            human: false,
        },
    });
    const c14 = await prisma.user.create({
        data: {
            email: "ysoon@gmail.com",
            name: "Young Soon",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("ysoon@gmail.com", false),
            human: false,
        },
    });
    const c15 = await prisma.user.create({
        data: {
            email: "cswam@gmail.com",
            name: "Chang Swam",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("cswam@gmail.com", false),
            human: false,
        },
    });

    // Humans ...........................................................................

	await prisma.user.create({ 
		data: { 
			email: "juaflore@gmail.com",
            name: "Juan Daniel Flores",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: await utils.generateIcon("juaflore@gmail.com", true),
			friends: {
				connect: [
					{ id: c1.id },
					{ id: c2.id },
					{ id: c3.id },
					{ id: c4.id },
					{ id: c5.id },
					{ id: c6.id },
					{ id: c7.id },
					{ id: c8.id },
					{ id: c9.id },
					{ id: c10.id },
					{ id: c11.id },
					{ id: c12.id },
					{ id: c13.id },
					{ id: c14.id },
					{ id: c15.id },
				]
			}
		} 
	});
}

fill();

module.exports = prisma;
