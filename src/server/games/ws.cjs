const { Pong, PongPlayer, PongTXT } = require('./pong.cjs')
const { TicTacToe, TicTacToePlayer, TicTacToeTXT } = require('./tictactoe.cjs')

const prisma = require('../prisma/prisma.cjs');
const tournamentSrv = require('../tournament/services/tournament.service')(prisma);
const chatSrv = require('../user-auth/services/chat.service')(prisma);
const userSrv = require('../user-auth/services/user.service')(prisma);

const MAX_USERS = 4;
const ANONYMOUS = 'anonymous@gmail.com';

const matchMap = new Map();
const socketMap = new Map();
const userMap = new Map();
const chatMap = new Map();
const onlineUsers = new Map();
const connMap = new Map();
const maps = {
	matchMap,
	socketMap,
	userMap,
	onlineUsers
}

function newGame(type, mid, limit, match) {
	return type === 'pong' ? new Pong(mid, limit, match, maps, broadcast) : new TicTacToe(mid, 2, match, maps, broadcast);
}

function newPlayer(type, user) {
	return type === 'pong' ? new PongPlayer(user) : new TicTacToePlayer(user);
}

function setUser(i, socket, raw, uid, match) {
	if (match[`user${i}`] && !match[`user${i}`].player && match[`user${i}Id`] === uid && match[`user${i}`].human) {
		match[`user${i}`].socket = socket;
		match[`user${i}`].raw = raw;
		const player = newPlayer(raw.type, match[`user${i}`]);
		match[`user${i}`].player = player;
		match.game.addPlayer(i - 1, player);
		match[`user${i}`].matchId = match.id;
		userMap.set(uid, match[`user${i}`]);

		if (match.user2Id === ANONYMOUS) {
			const p = match.user2;
			const r = Object.assign(raw, { });
			p.raw = r;
			p.initialized = true;
			const anonymous = newPlayer(raw.type, p);
			p.player = anonymous;
			match.game.addPlayer(1, anonymous);
		} else {
			/* If the rest of the users are bots ......................................... */
			for (let j = 1; j <= MAX_USERS; j++){
				const p = match[`user${j}`];
				if (p && i != j && !p.human) {
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
}

async function play(uid, socket, raw) {
	const user = userMap.get(uid);

	if (raw.subtype === 'connect') {
		const matches = await tournamentSrv.getCurrentTournamentMatchByUserId(uid, raw.tournamentId);
		let match = matches[0];
		let omatch = match;

		if (match) {
			// Use previous match because there is already related data .............. */
			if (matchMap.get(match.id))
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

			match.user1 = match.user1 || omatch.user1;
			match.user2 = match.user2 || omatch.user2;
			match.user1Id = match.user1Id || omatch.user1Id;
			match.user2Id = match.user2Id || omatch.user2Id;

			/* Update user's socket .................................................. */
			if (user) {
				user.socket = socket;
				match.game.send();
			}
				
			for (let i = 1; i <= MAX_USERS; i++)
				setUser(i, socket, raw,  uid, match);

		} else {
			socket.send(JSON.stringify({ redirect: '#/landing/nogame'}));
			return;
		}

	} else if (raw.subtype === 'play') {
		const match = socketMap.get(socket);
		if (user && match){
			if (match.round.tournament.totalPlayers > 2) {
				match.game.mplay(user.player, raw.isDown);
			} else {
				if (match.user2Id !== ANONYMOUS && (raw.key === 'k' || raw.key === 'm')) {
					return;
				}
				const i = raw.type === 'pong' ? raw.side : user.player.getSide();
				match.game.play(raw.isDown, i);
			}
		}
	} else if (raw.subtype === 'giveup') {
		const match = socketMap.get(socket);
		if (user && match){
			match.game.giveup(user.player.side); 
		}
	} else if (raw.subtype === 'layout') {
		if (user) {
			user.raw = raw;
			user.player.setScreen(raw);
		}
	}
}

async function chat(uid, socket, raw) {
	if (raw.subtype === 'mode') {
		chatMap.set(uid, { 
			mode: raw.mode, 
			user: raw.user, 
			friend: raw.mode === 'friend' ? raw.friendId : null,
			socket
		});

	} else if (raw.subtype === 'send') {
		chatSend(uid, raw);
		
	} else if (raw.subtype === 'block'){
		await chatSrv.blockUser(uid, raw.receiverId);
	}
}

const chatSend = async (uid, raw) => {
	const sender = chatMap.get(uid);
	const blocked = await chatSrv.getBlockedUsers(raw.receiverId);

	sender.socket.send(JSON.stringify({ type: 'chat',  sender: sender.user, text: raw.text }));

	for (let b of blocked){
		if (b.id === uid){
			return;
		}
	}

	chatSendReceiver(sender.user, raw.receiverId, raw.text);
}

const broadcast = async (tid, uid) => {
	const tour = await tournamentSrv.getTournamentById(tid);
	const matches = await tournamentSrv.getCurrentTournamentMatchByUserId(uid, tid);
	const match = matches[0];
	if (match && match.user1 && match.user2){
		const tournamentId = tour.id;
		const organizerId = tour.organizerId;
		const game = tour.game.name;
		const tname = tour.name;
		const organizer = await userSrv.getUserById(organizerId);
		const start = `<button type="button" data-link="#/landing/${game}/${tournamentId}" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Start</button>`;
		const link = `Your next game of the ${tname} tournament is ready to ${start}`;
		chatSendReceiver(organizer, match.user1Id, link);
		chatSendReceiver(organizer, match.user2Id, link);
	}
}

async function chatSendReceiver(sender, receiverId, text) {
	const receiver = chatMap.get(receiverId);
	if (receiver && receiver.mode !== 'off' && receiver.socket && receiver.socket.readyState !== WebSocket.CLOSED) {
		if (receiver.mode === 'count'){
			receiver.socket.send(JSON.stringify({ type: 'chat', count: 1 }));
		} else if (receiver.mode === 'list'){
			receiver.socket.send(JSON.stringify({ type: 'chat', sender, count: 1 }));
		} else if (receiver.mode === 'friend') {
			receiver.socket.send(JSON.stringify({ type: 'chat',  sender, text: text }));
		}
	}
	chatSrv.createMessage(sender.id, receiverId, text);
}

async function fn(fastify) {
  fastify.get('/ws', { websocket: true, preHandler: [fastify.authenticate] }, (socket, request) => {
	const userId = request.user.id;
	const conn = connMap.get(userId);
	onlineUsers.set(userId, true);

	if (conn && conn != socket)
		return;

	connMap.set(userId, socket);

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
		socketMap.delete(socket);
		onlineUsers.delete(userId);
		connMap.delete(userId);
	})

  })

  fastify.get('/api/online-status', { preHandler: [fastify.authenticate] }, async (request, reply) => {
	try {
		const userIds = request.query.ids ? request.query.ids.split(',') : [];
		const statuses = {};

		userIds.forEach(id => {
			statuses[id] = onlineUsers.has(id);
		});

		return reply.send(statuses);
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: 'Failed to fetch online statuses' });
	}
  });
};

exports.connMap = connMap;
exports.fn = fn;
