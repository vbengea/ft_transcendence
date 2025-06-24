const prisma = require('../prisma/prisma.cjs');
const tournamentSrv = require('../tournament/services/tournament.service')(prisma);

const TXT = {
	full: "Room is full.",
	success:  "",
	waiting: "Waiting for a peer to connect.",
	giveup: "You win. the other player just gave up!",
	win: "#/landing/win",
	loose: "#/landing/loose",
	wait: 'Please wait for other peer(s) to connect'
};

const DIM = 3;

class Screen {

	constructor (raw) {
		this.width = raw.screen.w;
		this.height = raw.screen.h;
	}

	getWidth() {
		return this.width;
	}

	setWidth(w) {
		this.width = w;
	}

	getHeight() {
		return this.height;
	}

	setHeight(h) {
		this.height = h;
	}

}

class Player {

	constructor (user, alias) {
		this.wins = false;
		this.screen = new Screen(user.raw);
		this.score = 0;
		this.ai = !user.human;
		this.user = user;
		this.side = 0;
		this.alias = alias;
	}

	getUser() {
		return this.user;
	}

	getSocket() {
		return this.user.socket;
	}

	getSide() {
		return this.side;
	}

	setSide(side) {
		this.side = side;
	}

	getScreen() {
		return this.screen;
	}

	setScreen() {
		this.screen = new Screen(this.user.raw);
	}

	setWins(w) {
		this.wins = w;
	}

	getWins() {
		return this.wins;
	}

	getScore() {
		return this.score;
	}

	setScore(score) {
		this.score = score;
	}

	toJSON() {
		return {
			wins: this.wins,
			score: this.score,
			screen: this.screen,
			user: {
				id: this.user.id,
				name: this.user.name,
				avatar: this.user.avatar,
				customization: this.user.customization,
				alias: this.alias
			}
		};
	}
}

class TicTacToe {

	constructor(mid, limit, match, maps, broadcast, score_max) {
		this.status = 0;
		this.render = 0;
		this.players = [];
		this.scores = [0, 0];
		this.matrix = [[0,0,0],[0,0,0],[0,0,0]];
		this.last = 'o';
		this.mid = mid;
		this.match = match;
		this.limit = limit;
		this.matchMap = maps.matchMap;
		this.maps = maps;
		this.broadcast = broadcast;
		this.score_max = score_max;
	}

	toJSON() {
		return {
			matrix: this.matrix,
			players: this.players
		}
	}

	async start() {
		this.reset();
		await tournamentSrv.startMatch(this.mid);
	}

	reset() {
		this.matrix = [[0,0,0],[0,0,0],[0,0,0]];
		this.send();
	}

	send() {
		if (this.players[0]) {
			this.players[0].setScore(this.scores[0]);
		}
		if (this.players[1]) {
			this.players[1].setScore(this.scores[1]);
		}
		const json = JSON.stringify(this);
		if (this.players[0]) {
			const s = this.players[0].getSocket();
			if (s) {
				s.send("{ \"game\": " + json + ", \"side\": 0 }");
			}
		}
		if (this.players[1]) {
			const s = this.players[1].getSocket();
			if (s) {
				s.send("{ \"game\": " + json + ", \"side\": 1 }");
			}
		}
	}

	addPlayer(index, player) {
		player.setSide(index);
		this.players[index] = player;
		if (this.players[0] && this.players[1]) {
			for(let p of this.players) {
				if (p && p.getSocket())
					p.getSocket().send(JSON.stringify({ message: TXT.success, match: this.getMatch() }));
			}
			setTimeout(() => { this.start(); }, 1000);
		} else {
			for(let p of this.players) {
				if (p && p.getSocket())
					p.getSocket().send(JSON.stringify({ message: TXT.wait, match: this.getMatch() }));
			}
		}
	}

	getMatch() {
		const match = { counter: 2 };
		const u1 = this.match.user1;
		const u2 = this.match.user2;
		match.user1 = { name: u1 ? u1.name : 'Unknown', avatar: u1 ? u1.avatar : './images/user.png' };
		match.user2 = { name: u2 ? u2.name : 'Unknown', avatar: u2 ? u2.avatar : './images/user.png' };
		if (this.match.user3) {
			match.user3 = { name: this.match.user3.name, avatar: this.match.user3.avatar };
			match.counter++;
		}
		if (this.match.user4) {
			match.user4 = { name: this.match.user4.name, avatar: this.match.user4.avatar };
			match.counter++;
		}
		return match;
	}

	giveup(side) {
		if (side === 0) {
			this.scores[1] = this.score_max;
			this.manageResults(1);
		} else if (side === 1) {
			this.scores[0] = this.score_max;
			this.manageResults(0);
		}
	}

	async manageResults(winnerSide) {
		await tournamentSrv.endMatch(this.mid, this.scores[0], this.scores[1]);
		for(let p of this.players) {
			if (p) {
				if (p.getSide() === winnerSide) {
					await tournamentSrv.advanceToNextMatch(this.match, p.getUser());
					this.broadcast(this.match.round.tournament.id, p.getUser().id);
					p.wins = true;
					const s1 = p.getSocket();
					if (s1)
						s1.send(JSON.stringify({ redirect: `${TXT.win}/${this.match.round.tournament.id}` }));
				} else {
					p.wins = false;
					const s2 = p.getSocket();
					if (s2)
						s2.send(JSON.stringify({ redirect: `${TXT.loose}/${this.match.round.tournament.id}` }));
				}
				this.maps.socketMap.delete(p.getSocket());
				this.maps.userMap.delete(p.getUser().id);
			}
		}
		this.maps.matchMap.delete(this.match.id);
	}

	async play(down, i) {
		const p1 = this.players[0];
		const p2 = this.players[1];
		if (p1 && p2) {
			const player = this.players[i];
			const socket = player ? player.getSocket() : null;

			down -= 1;
			let row = Math.floor(down / DIM);
			let col = down % DIM;
			this.status = 1;

			if (this.matrix[row][col] === 0) {
				let current = '';

				if (this.last === 'o') {
					if (socket !== p1.getSocket())
						return;
					current = 'x';
				} else {
					if (socket !== p2.getSocket())
						return;
					current = 'o';
				}

				this.matrix[row][col] = current;
				this.last = this.matrix[row][col];

				// SCORES																			// Determine the winner .............................
				let p = '';
				for (let i = 0; i < DIM; i++) {
					p = this.verifyVertical(i);
					if (p)
						break;
					p = this.verifyHorizontal(i);
					if (p)
						break;
				}
				if (!p)
					p = this.verifyDiagonal();

				if (p === 'x') {
					this.scores[0]++;
					this.reset();
				} else if (p == 'o') {
					this.scores[1]++;
					this.reset();
				}

				if (this.scores[0] >= this.score_max) {													// Check scores .....................................
					this.manageResults(0);

				} else if (this.scores[1] == this.score_max) {
					this.manageResults(1);

				} else {
					let n = 0;
					for (let i = 0; i < this.matrix.length; i++) {
						for (let j = 0; j < this.matrix[i].length; j++) {
							if (this.matrix[i][j] !== 0)
								n++;
						}
					}
					if (n === DIM * DIM)
						this.reset();
					else
						this.send();

					if (player === p1 && !p2.getUser().human) {										// Computer play ....................................
						setTimeout(() => {
							while (this.matrix[row][col] === 'x' || this.matrix[row][col] === 'o') {
								down = Math.floor(Math.random() * 9) + 1
								down -= 1;
								row = Math.floor(down / DIM);
								col = down % DIM;
							}
							this.play(down + 1, 1);
						}, 1000);
					}
				}
			}
		}
	}

	verifyVertical(c) {
		const a1r = this.matrix[0][c];
		const a2r = this.matrix[1][c];
		const a3r = this.matrix[2][c];
		if (a1r == a2r && a2r == a3r && a1r !== 0)
			return a1r;
		return '';
	}

	verifyHorizontal(r) {
		const ar1 = this.matrix[r][0];
		const ar2 = this.matrix[r][1];
		const ar3 = this.matrix[r][2];
		if (ar1 == ar2 && ar2 == ar3 && ar1 !== 0)
			return ar1;
		return '';
	}

	verifyDiagonal() {
		const d11 = this.matrix[0][0];
		const d12 = this.matrix[1][1];
		const d13 = this.matrix[2][2];

		const d21 = this.matrix[0][2];
		const d22 = this.matrix[1][1];
		const d23 = this.matrix[2][0];
		if (d11 == d12 && d12 == d13 && d11 !== 0)
			return d11;
		if (d21 == d22 && d22 == d23 && d21 !== 0)
			return d21;
		return '';
	}

}

exports.TicTacToe = TicTacToe;
exports.TicTacToePlayer = Player;