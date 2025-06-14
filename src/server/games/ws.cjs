const { Pong, PongPlayer, PongTXT } = require('./pong.cjs')
const { TicTacToe, TicTacToePlayer, TicTacToeTXT } = require('./tictactoe.cjs')

const prisma = require('../prisma/prisma.cjs');
const tournamentSrv = require('../tournament/services/tournament.service')(prisma);

function newGame(type, mid, limit, match) {
	return type === 'pong' ? new Pong(mid, limit, match) : new TicTacToe(mid, 2, match);
}
function newPlayer(type, user) {
	return type === 'pong' ? new PongPlayer(user) : new TicTacToePlayer(user);
}

const MAX_USERS = 4;

const matchMap = new Map();
const socketMap = new Map();
const userMap = new Map();

// TODO: merge userMap and socketMap with connMap
const connMap = new Map();

function setUser(i, socket, raw, uid, match) {
	if (match[`user${i}Id`] === uid && match[`user${i}`].human) {
		match[`user${i}`].socket = socket;
		match[`user${i}`].raw = raw;
		const player = newPlayer(raw.type, match[`user${i}`]);
		match[`user${i}`].player = player;
		match.game.addPlayer(i - 1, player);
		match[`user${i}`].matchId = match.id;
		userMap.set(uid, match[`user${i}`]);

		/* If the rest of the users are bots ................................... */
		for (let j = 1; j <= MAX_USERS; j++){
			const p = match[`user${j}`];
			if (p && i != j && !p.human && !p.initialized) {
				const r = Object.assign(raw, { });
				p.raw = r;
				p.initialized = true;
				const computer = newPlayer(raw.type, p);
				p.player = computer;
				match.game.addPlayer(j - 1, computer);
			}
		}
	}
}

async function play(uid, socket, raw) {
	const user = userMap.get(uid);

	if (raw.subtype === 'connect') {
		const matches = await tournamentSrv.getCurrentTournamentMatchByUserId(uid);
		let match = matches[0];

		if (match) {
			// Use previous match because there is already related data .............. */
			if (matchMap.has(match.id))
				match = matchMap.get(match.id)
			else
				matchMap.set(match.id, match);

			socketMap.set(socket, match);

			/* Connecting for the first time ......................................... */
			if (!match.game) {
				let limit = 2;
				if (match.round.tournament.totalRounds == 1)
					limit = match.round.tournament.totalPlayers;

				match.game = newGame(raw.type, match.id, limit, match);
			}

			/* Update user's socket .................................................. */
			if (user)
				user.socket = socket;

			/* Update socket and layout information .................................. */
			for (let i = 1; i <= MAX_USERS; i++)
				setUser(i, socket, raw,  uid, match);
		} else {
			socket.send(JSON.stringify({ redirect: '#/landing/nogame'}));
			return;
		}

	} else if (raw.subtype === 'play') {
		const match = socketMap.get(socket);
		if (user && match)
			match.game.play(user.player, raw.isDown, 0); 
	} else if (raw.subtype === 'layout') {
		if (user) {
			user.raw = raw;
			user.player.setScreen(raw);
		}
	}
}

async function chat(uid, socket, raw) {
	// Handle chat
}

module.exports = async function (fastify) {
  fastify.get('/ws', { websocket: true, preHandler: [fastify.authenticate] }, (socket, request) => {

	connMap.set(request.user.id, { socket });

	socket.on('message', async (message) => {
		const raw = JSON.parse(message.toString());
		const uid = request.user.id;
		if (raw.type == 'pong' || raw.type == 'tictactoe') {
			play(uid, socket, raw);
		} else if (raw.type == 'chat') {
			chat(uid, socket, raw);
		}
	})

	socket.on('close', message => {
		const uid = request.user.id;
		let user = userMap.get(uid);
		if (user) {
			const match = matchMap.get(user.matchId);
			if (match)
				matchMap.delete(user.matchId);
			userMap.delete(uid);
		}
		socketMap.delete(socket);
		connMap.delete(uid);
	})

  })
};