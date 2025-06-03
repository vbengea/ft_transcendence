const TXT = {
	full: "Room is full.",
	success:  "",
	waiting: "Waiting for a peer to connect.",
	giveup: "You win. the other player just gave up!",
	win: "You win!"
};

const DIM = 3;
const LIMIT = 2;
const MAX_SCORE = 10;

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

	constructor() {
		this.status = 0;
		this.render = 0;
		this.players = [];
		this.matrix = [];
		this.last = '';
	}

	start() {
		this.reset();
	}

	reset() {
		this.matrix = [[0,0,0],[0,0,0],[0,0,0]];
		this.last = '';
		this.send();
	}

	send() {
		if (!this.isFull())
			return;
		const json = JSON.stringify(this);
		this.players[0].getSocket().send("{ \"game\": " + json + ", \"side\": 0 }");
		this.players[1].getSocket().send("{ \"game\": " + json + ", \"side\": 1 }");
	}

	isFull() {
		return this.players.length >= LIMIT;
	}

	addPlayer(player) {
		if (this.isFull())
			return;

		this.players.push(player);
		
		if (this.players.length == LIMIT) {
			player.getSocket().send(JSON.stringify({ message: TXT.success }));
			this.start();
		} else {
			player.getSocket().send(JSON.stringify({ message: TXT.waiting }));
		}
	}

	play(socket, down) {
		if (this.status === 0 && socket === this.players[1].getSocket())
			return;

		down -= 1;
		const row = Math.floor(down / DIM);
		const col = down % DIM;
		this.status = 1;

		if (this.matrix[row][col] === 0) {
			if (socket === this.players[0].getSocket() && this.last !== 'x') {
				this.matrix[row][col] = 'x';
			} else if (socket === this.players[1].getSocket() && this.last !== 'o'){
				this.matrix[row][col] = 'o';
			} else {
				return ;																		// Player intending to play again ...................
			}


			// SCORES
			let p = '';
			for (let i = 0; i < this.matrix.length; i++) {
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
				this.players[0].incrementScore();
				this.reset();
			} else if (p == 'o') {
				this.players[1].incrementScore();
				this.reset();
			}

			if (this.players[0].getScore() === MAX_SCORE) {										// Check scores .................................
				this.players[0].wins = true;
				this.players[0].getSocket().send(JSON.stringify({ message: TXT.win }));
				this.reset();
			} else if (this.players[1].getScore() === MAX_SCORE) {
				this.players[1].wins = true;
				this.players[1].getSocket().send(JSON.stringify({ message: TXT.win }));
				this.reset();
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
			}
		}
	}

	verifyVertical(c) {
		if (this.matrix[0][c] === this.matrix[1][c] && this.matrix[1][c] === this.matrix[2][c] && this.matrix[0][c] !== 0 )
			return this.matrix[0][c];
		return '';
	}

	verifyHorizontal(r) {
		if (this.matrix[r][0] === this.matrix[r][1] && this.matrix[r][1] === this.matrix[r][2] && this.matrix[r][0] !== 0)
			return this.matrix[0][r];
		return '';
	}

	verifyDiagonal() {
		if (this.matrix[0][0] === this.matrix[1][1] && this.matrix[1][1] === this.matrix[2][2] && this.matrix[0][0] !== 0)
			return this.matrix[0][0];
		else if (this.matrix[0][2] === this.matrix[1][1] && this.matrix[1][1] === this.matrix[2][0] && this.matrix[0][2] !== 0)
			return this.matrix[0][2];
		return '';
	}

}

exports.TicTacToe = TicTacToe;
exports.TicTacToePlayer = Player;
exports.TicTacToeTXT = TXT;