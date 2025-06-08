const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jdenticon = require("jdenticon");

async function fill() {
	const size = 200;

    await prisma.game.create({ data: { description: "Pong", name: "pont" } });
    await prisma.game.create({
        data: { description: "Tic tac toe", name: "tictactoe" },
    });

    // Bots .............................................................................

    const c1 = await prisma.user.create({
        data: {
            email: "edgar@gmail.com",
            name: "Edgar Allan Poe",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });
    const c2 = await prisma.user.create({
        data: {
            email: "tolstoi@gmail.com",
            name: "Léon Tolstói",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });
    const c3 = await prisma.user.create({
        data: {
            email: "unamuno@gmail.com",
            name: "Miguel de Unamuno",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });

    const c4 = await prisma.user.create({
        data: {
            email: "alincoln@gmail.com",
            name: "Abraham Lincoln",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });
    const c5 = await prisma.user.create({
        data: {
            email: "gwashing@gmail.com",
            name: "George Washington",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });
    const c6 = await prisma.user.create({
        data: {
            email: "tjefferson@gmail.com",
            name: "Thomas Jefferson",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });

    const c7 = await prisma.user.create({
        data: {
            email: "ccolon@gmail.com",
            name: "Cristobal Colón",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });
    const c8 = await prisma.user.create({
        data: {
            email: "florca@gmail.com",
            name: "Federico García Lorca",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });
    const c9 = await prisma.user.create({
        data: {
            email: "avargas@gmail.com",
            name: "Alan Vargas",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });

    const c10 = await prisma.user.create({
        data: {
            email: "jausten@gmail.com",
            name: "Jane Austen",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });
    const c11 = await prisma.user.create({
        data: {
            email: "psmith@gmail.com",
            name: "Paul Smith",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });
    const c12 = await prisma.user.create({
        data: {
            email: "jsiemens@gmail.com",
            name: "John Siemens",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });

    const c13 = await prisma.user.create({
        data: {
            email: "jsolomon@gmail.com",
            name: "Jake Solomon",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });
    const c14 = await prisma.user.create({
        data: {
            email: "ysoon@gmail.com",
            name: "Young Soon",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });
    const c15 = await prisma.user.create({
        data: {
            email: "cswam@gmail.com",
            name: "Chang Swam",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
            human: false,
        },
    });

    // Humans ...........................................................................

    const friends = [
		await prisma.friend.create({ data: { userId: c1.id } }),
		await prisma.friend.create({ data: { userId: c2.id } }),
		await prisma.friend.create({ data: { userId: c3.id } }),
		await prisma.friend.create({ data: { userId: c4.id } }),
		await prisma.friend.create({ data: { userId: c5.id } }),
		await prisma.friend.create({ data: { userId: c6.id } }),
		await prisma.friend.create({ data: { userId: c7.id } }),
		await prisma.friend.create({ data: { userId: c8.id } }),
		await prisma.friend.create({ data: { userId: c9.id } }),
		await prisma.friend.create({ data: { userId: c10.id } }),
		await prisma.friend.create({ data: { userId: c11.id } }),
		await prisma.friend.create({ data: { userId: c12.id } }),
		await prisma.friend.create({ data: { userId: c13.id } }),
		await prisma.friend.create({ data: { userId: c14.id } }),
		await prisma.friend.create({ data: { userId: c15.id } })
	];

	await prisma.user.create({ 
		data: { 
			email: "juaflore@gmail.com",
            name: "Juan Daniel Flores",
            passwordHash: "$2a$10$04XSlcWwriUAv9jaV5YXXuN0xzs3gLc3/smPT.WytRQSa8kALUWRC",
			avatar: "",
			friends: {
				connect: friends.map(f => ({ id: f.id }))
			}
		} 
	});
}

fill();

module.exports = prisma;
