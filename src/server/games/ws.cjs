const { Pong, PongPlayer, PongTXT } = require('./pong.cjs')
const { TicTacToe, TicTacToePlayer, TicTacToeTXT } = require('./tictactoe.cjs')

const prisma = require('../prisma/prisma.cjs');
const userSrv = require('../user-auth/services/user.service')(prisma);
const tournamentSrv = require('../tournament/services/tournament.service')(prisma);

function newGame(type, mid) {
	return type === 'pong' ? new Pong(mid) : new TicTacToe(mid);
}
function newPlayer(type, { socket, raw }) {
	return type === 'pong' ? new PongPlayer(socket, raw) : new TicTacToePlayer(socket, raw);
}

const matchMap = new Map();

module.exports = async function (fastify) {
  fastify.get('/ws', { websocket: true, preHandler: [fastify.authenticate] }, (socket, request) => {

	socket.on('message', async (message) => {
		const raw = JSON.parse(message.toString())

		if (raw.type == 'pong' || raw.type == 'tictactoe') {
			const user = await userSrv.getUserById(request.user.id);
			const matches = await tournamentSrv.getCurrentTournamentMatchByUserId(user.id);

			if (matches.length){
				/* Identifying match ............................. */
				const match = matches[0];
				if (!matchMap.has(match.id))
					matchMap.set(match.id, match);
				const currentMatch = matchMap.get(match.id);

				if (raw.subtype === 'connect') {
					/* Create game ............................... */
					if (!currentMatch.game)
						currentMatch.game = newGame(raw.type, currentMatch.id);

					/* Update socket and layout information ...... */
					if (currentMatch.user1Id === user.id) {
						currentMatch.user1.socket = socket;
						currentMatch.user1.raw = raw;
						currentMatch.game.addPlayer(newPlayer(raw.type, currentMatch.user1))

						/* If the rest of the users are bots ..... */
						if (!currentMatch.user2.human)  {
							const r = Object.assign(raw, { });
							currentMatch.user2.raw = r;
							currentMatch.game.addPlayer(newPlayer(raw.type, currentMatch.user2));
						}

					} else if (currentMatch.user2Id === user.id) {
						currentMatch.user2.socket = null;
						currentMatch.user2.socket = socket;
						currentMatch.user2.raw = raw;
						currentMatch.game.addPlayer(newPlayer(raw.type, currentMatch.user2))

						/* If the rest of the users are bots ..... */
						if (!currentMatch.user1.human)  {
							const r = Object.assign(raw, { });
							currentMatch.user1.raw = r;
							currentMatch.game.addPlayer(newPlayer(raw.type, currentMatch.user1));
						}
					}

				} else if (raw.subtype === 'play') {
					currentMatch.game.play(socket, raw.isDown); 
				} else if (raw.subtype === 'play_ai') {
					currentMatch.game.play_ai(socket); 
				} else if (raw.subtype === 'layout') {
					currentMatch.game.setLayout(socket, raw); 
				}
			}
		}

	})

	socket.on('close', message => {
		// const game = socketGame.get(socket);
		// for( let i = 0; i < game.players.length; i++ ) {
		// 	const p = game.players[i];
		// 	if (p.getSocket() == socket){
		// 		game.players.splice(i, 1);
		// 		break;
		// 	}
		// }
		// for ( let p of game.players ) {
		// 	p.getSocket().send(JSON.stringify({ message: PongTXT.giveup }))
		// }
	})

  })
};