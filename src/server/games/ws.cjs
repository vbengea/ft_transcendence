const { Pong, PongPlayer, PongTXT } = require('./pong.cjs')
const { TicTacToe, TicTacToePlayer, TicTacToeTXT } = require('./tictactoe.cjs')

const prisma = require('../prisma/prisma.cjs');
const tournamentSrv = require('../tournament/services/tournament.service')(prisma);

function newGame(type, mid, limit) {
	return type === 'pong' ? new Pong(mid, limit) : new TicTacToe(mid);
}
function newPlayer(type, player) {
	return type === 'pong' ? new PongPlayer(player) : new TicTacToePlayer(player.socket, player.raw);
}

const MAX_USERS = 4;
const matchMap = new Map();
const socketMap = new Map();

function setUser(i, socket, raw, uid, match) {
	if (match[`user${i}Id`] === uid && match[`user${i}`].human) {
		match[`user${i}`].socket = socket;
		match[`user${i}`].raw = raw;
		match.game.addPlayer(newPlayer(raw.type, match[`user${i}`]))

		/* If the rest of the users are bots ................................... */
		for (let j = 1; j <= MAX_USERS; j++){
			const p = match[`user${j}`];
			if (p && i != j && !p.human && !p.initialized) {
				const r = Object.assign(raw, { });
				p.raw = r;
				p.initialized = true;
				match.game.addPlayer(newPlayer(raw.type, p));
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
			const matches = socketMap[socket] || await tournamentSrv.getCurrentTournamentMatchByUserId(uid);
			socketMap[socket] = matches;
			if (matches.length){

				/* Identifying match ........................................................... */
				const match = matches[0];
				if (!matchMap.has(match.id))
					matchMap.set(match.id, match);
				const currentMatch = matchMap.get(match.id);

				if (raw.subtype === 'connect') {
					/* Create game ............................................................. */
					if (!currentMatch.game) {
						let limit = 2;
						if (currentMatch.tournament.totalRounds == 1)
							limit = currentMatch.round.tournament.totalPlayers;
						console.log(currentMatch.round.tournament.totalPlayers)
						currentMatch.game = newGame(raw.type, currentMatch.id, limit);
					}

					/* Update socket and layout information .................................... */
					for (let i = 1; i <= MAX_USERS; i++)
						setUser(i, socket, raw,  uid, currentMatch);

				} else if (raw.subtype === 'play') {
					currentMatch.game.play(socket, raw.isDown); 
				} else if (raw.subtype === 'layout') {
					currentMatch.game.setLayout(socket, raw); 
				}
			}
		}

	})

	socket.on('close', message => {
		// TODO: Gestionar desconexion
	})

  })
};