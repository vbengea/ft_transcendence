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
const LIMIT = 2;
const MAX_SCORE = 3;

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
	constructor (socket, raw) {
		this.wins = false;
		this.socket = socket;
		this.screen = new Screen(raw);
		this.score = 0;
	}

	getSocket() {
		return this.socket;
	}

	getScreen() {
		return this.screen;
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

	incrementScore() {
		this.score++;
	}

	toJSON() {
		return {
			wins: this.wins,
			score: this.score,
			screen: this.screen
		};
	}
}

class TicTacToe {

	constructor(mid, match) {
		this.status = 0;
		this.render = 0;
		this.players = [];
		this.matrix = [];
		this.last = '';
		this.mid = mid;
		this.match = match;
	}

	start() {
		tournamentSrv.startMatch(this.mid);
		this.reset();
	}

	reset() {
		this.matrix = [[0,0,0],[0,0,0],[0,0,0]];
		this.last = '';
		this.send();
	}

	send() {
		const json = JSON.stringify(this);
		const s1 = this.players[0].getSocket();
		const s2 = this.players[1].getSocket();
		if (s1)
			s1.send("{ \"game\": " + json + ", \"side\": 0 }");
		if (s2)
			s2.send("{ \"game\": " + json + ", \"side\": 1 }");
	}

	addPlayer(player) {
		this.players.push(player);

		if (this.players.length == LIMIT) {
			for(let p of this.players) {
				if (p.getSocket())
					p.getSocket().send(JSON.stringify({ message: TXT.success }));
			}
			this.start();
		} else if(player.getSocket()) {
			const match = { counter: 2 };
			const u1 = this.match.user1;
			const u2 = this.match.user2;
			match.user1 = { name: u1 ? u1.name : 'Unknown', avatar: u1 ? u1.avatar : './images/user.png' };
			match.user2 = { name: u2 ? u2.name : 'Unknown', avatar: u2 ? u2.avatar : './images/user.png' };
			for(let p of this.players) {
				if (p.getSocket())
					p.getSocket().send(JSON.stringify({ message: TXT.wait, match }));
			}
		}
	}

	play(player, down, i) {
		const p1 = player || this.players[0];
		const p2 = this.players[1];
		const socket = this.players[i].getSocket();

		down -= 1;
		let row = Math.floor(down / DIM);
		let col = down % DIM;
		this.status = 1;

		if (this.matrix[row][col] === 0) {
			if (socket === p1.getSocket() && this.last !== 'x') {
				this.matrix[row][col] = 'x';
			} else if (socket === p2.getSocket() && this.last !== 'o'){
				this.matrix[row][col] = 'o';
			} else {
				return ;																		// Player intending to play again ...................
			}

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
				p1.incrementScore();
				this.reset();
			} else if (p == 'o') {
				p2.incrementScore();
				this.reset();
			}

			if (p1.getScore() == MAX_SCORE) {													// Check scores .....................................
				tournamentSrv.endMatch(this.mid, p1.getScore(), p2.getScore());
				p1.wins = true;
				p2.wins = false;
				const s1 = p1.getSocket();
				if (s1)
					s1.send(JSON.stringify({ redirect: TXT.win }));
				const s2 = p2.getSocket();
				if (s2)
					s2.send(JSON.stringify({ redirect: TXT.loose }));

			} else if (p2.getScore() == MAX_SCORE) {
				tournamentSrv.endMatch(this.mid, p1.getScore(), p2.getScore());
				p1.wins = false;
				p2.wins = true;
				const s1 = p1.getSocket();
				if (s1)
					s1.send(JSON.stringify({ redirect: TXT.loose }));
				const s2 = p2.getSocket();
				if (s2)
					s2.send(JSON.stringify({ redirect: TXT.win }));

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
				this.last = this.matrix[row][col];

				if (socket) {																	// Computer play ....................................
					setTimeout(() => {
						while (this.matrix[row][col] === 'x' || this.matrix[row][col] === 'o') {
							down = Math.floor(Math.random() * 9) + 1
							down -= 1;
							row = Math.floor(down / DIM);
							col = down % DIM;
						}
						this.play(undefined, down + 1, 1);
					}, 1000);
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
exports.TicTacToeTXT = TXT;