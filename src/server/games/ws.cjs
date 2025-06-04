const { Pong, PongPlayer, PongTXT } = require('./pong.cjs')
const { TicTacToe, TicTacToePlayer, TicTacToeTXT } = require('./tictactoe.cjs')

const socketGame = new Map();
let currentPongGame = new Pong();
let currentTicTacToeGame = new TicTacToe();

function newGame(type) {
	return type === 'pong' ? new Pong() : new TicTacToe();
}
function newPlayer(type, socket, raw) {
	return type === 'pong' ? new PongPlayer(socket, raw) : new TicTacToePlayer(socket, raw);
}
function gameCur(type) {
	return type === 'pong' ? currentPongGame : currentTicTacToeGame;
}

module.exports = async function (fastify) {
  fastify.get('/ws', { websocket: true, preHandler: [fastify.authenticate] }, (socket, req) => {

	socket.on('message', (message) => {
		const raw = JSON.parse(message.toString())
		if (raw.type == 'pong' || raw.type == 'tictactoe') {
			const currentGame = gameCur(raw.type);
			if (raw.subtype === 'connect') {
				if (currentGame.isFull()) {
					currentGame = newGame(raw.type)
					currentGame.addPlayer(newPlayer(raw.type, socket, raw))
				} else {
					currentGame.addPlayer(newPlayer(raw.type, socket, raw))
				}
				socketGame.set(socket, currentGame);
			} else if (raw.subtype === 'play') {
				const game = socketGame.get(socket);
				game.play(socket, raw.isDown); 
			} else if (raw.subtype === 'layout') {
				const game = socketGame.get(socket);
				game.setLayout(socket, raw); 
			}
		}
	})

	socket.on('close', message => {
		const game = socketGame.get(socket);
		for( let i = 0; i < game.players.length; i++ ) {
			const p = game.players[i];
			if (p.getSocket() == socket){
				game.players.splice(i, 1);
				break;
			}
		}
		for ( let p of game.players ) {
			p.getSocket().send(JSON.stringify({ message: PongTXT.giveup }))
		}
	})

  })
};