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

function setUser(i, socket, raw, uid, match) {
	if (match[`user${i}Id`] === uid && match[`user${i}`].human) {
		match[`user${i}`].socket = socket;
		match[`user${i}`].raw = raw;
		const player = newPlayer(raw.type, match[`user${i}`]);
		match[`user${i}`].player = player;
		match.game.addPlayer(player);
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
				match.game.addPlayer(computer);
			}
		}
	}
}

module.exports = async function (fastify) {
  fastify.get('/ws', { websocket: true, preHandler: [fastify.authenticate] }, (socket, request) => {

	socket.on('message', async (message) => {
		const raw = JSON.parse(message.toString())

		if (raw.type == 'pong' || raw.type == 'tictactoe') {
			const uid = request.user.id;
			let matches = socketMap.get(socket);

			if (!matches)
				matches = await tournamentSrv.getCurrentTournamentMatchByUserId(uid);

			if (!matches || matches.length === 0)
			{
				socket.send(JSON.stringify({ redirect: '#/landing/nogame'}));
				return;
			}

			socketMap.set(socket, matches);

			if (matches.length){

				/* Identifying match ........................................................... */
				const match = matches[0];
				if (!matchMap.has(match.id))
					matchMap.set(match.id, match);

				const currentMatch = matchMap.get(match.id);

				/* Verify user is already loaded ............................................... */
				let user = userMap.get(uid);

				if (raw.subtype === 'connect') {
					/* Create game ............................................................. */
					if (!currentMatch.game) {
						let limit = 2;
						if (currentMatch.round.tournament.totalRounds == 1)
							limit = currentMatch.round.tournament.totalPlayers;
						currentMatch.game = newGame(raw.type, currentMatch.id, limit, currentMatch);

					} else  {

						if (user) {
							user.socket = socket;
							return;
						}

					}

					/* Update socket and layout information ................................ */
					for (let i = 1; i <= MAX_USERS; i++)
						setUser(i, socket, raw,  uid, currentMatch);

				} else if (raw.subtype === 'play') {
					if (user)
						currentMatch.game.play(user.player, raw.isDown, 0); 
				} else if (raw.subtype === 'layout') {
					if (user) {
						user.raw = raw;
						user.player.setScreen(raw);
					}
				}
			}
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
	})

  })
};