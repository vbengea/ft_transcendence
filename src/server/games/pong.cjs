const LIMIT = 2;
const MAX_SCORE = 10;

const TXT = {
	full: "Room is full.",
	success:  "",
	waiting: "Waiting for a peer to connect.",
	giveup: "You win. the other player just gave up!",
	win: "You win!"
};

class Ball {
	constructor (x, y, w, h) {
		this.width = w;
		this.height = h;
		this.x = x;
		this.y = y;
		this.dx = 1;
		this.dy = 1;
	}

	getX() {
		return this.x;
	}

	setX(x) {
		this.x = x;
	}

	getY() {
		return this.y;
	}

	setY(y) {
		this.y = y;
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

	getDx() {
		return this.dx;
	}

	setDx(dx) {
		this.dx = dx;
	}

	getDy() {
		return this.dy;
	}

	setDy(dy) {
		this.dy = dy;
	}

}

class Paddle {
	constructor ({ x, y, w, h }) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}

	getX() {
		return this.x;
	}

	setX(x) {
		this.x = x;
	}

	getY() {
		return this.y;
	}

	setY(y) {
		this.y = y;
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

class Screen {
	constructor (raw) {
		this.width = raw.screen.w;
		this.height = raw.screen.h;
		this.lineHeight = raw.screen.lineHeight;
		this.ball = new Ball(0, 0, raw.ball.w, raw.ball.h);
		this.leftPaddle = new Paddle(raw.paddle.left);
		this.rightPaddle = new Paddle(raw.paddle.right);
	}
	
	getBall() {
		return this.ball;
	}

	getLeftPaddle() {
		return this.leftPaddle;
	}

	getRightPaddle() {
		return this.rightPaddle;
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

	getLineHeight() {
		return this.lineHeight;
	}

	setLineHeight(h) {
		this.lineHeight = h;
	}

}

class Player {
	constructor (socket, raw) {
		this.wins = false;
		this.socket = socket;
		this.screen = new Screen(raw);
		this.score = 0;
		this.ai = raw.ai;
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

	isAi() {
		return this.ai;
	}

	toJSON() {
		return {
			wins: this.wins,
			score: this.score,
			screen: this.screen
		};
	}
}

class Pong {

	constructor() {
		this.status = 0;
		this.render = 0;
		this.players = [];
	}

	start() {
		this.status = 1;
		this.reset();
		this.moveBall();
	}

	send() {
		if (!this.isFull())
			return;
		const s1 = this.players[0].getScreen();
		const b1 = s1.getBall();
		const p1a = s1.getLeftPaddle();
		const p1b = s1.getRightPaddle();

		const s2 = this.players[1].getScreen();
		const b2 = s2.getBall();
		const p2a = s2.getLeftPaddle();
		const p2b = s2.getRightPaddle();

		const wRatio = s2.getWidth() / s1.getWidth();
		const hRatio = s2.getHeight() / s1.getHeight();

		b2.setX(b1.getX() * wRatio);
		b2.setY(b1.getY() * hRatio);

		p2a.setY(p1a.getY() * hRatio);
		p1b.setY(p2b.getY() / hRatio);

		const json = JSON.stringify(this);
		const socket1 = this.players[0].getSocket();
		const socket2 = this.players[1].getSocket();
		if (socket1)
			socket1.send("{ \"game\": " + json + ", \"side\": 0 }");
		if (socket2)
			socket2.send("{ \"game\": " + json + ", \"side\": 1 }");
	}

	isFull() {
		return this.players.length >= LIMIT;
	}

	addPlayer(player) {
		if (this.isFull())
			return;

		this.players.push(player);
		const socket = player.getSocket();
		if (this.players.length == LIMIT) {
			if (socket)
				socket.send(JSON.stringify({ message: TXT.success }));
			this.start();
		} else {
			if (socket)
				socket.send(JSON.stringify({ message: TXT.waiting }));
		}
	}

	rand(max) {
		return Math.floor(Math.random() * max);
	}

	randomSign() {
		return Math.random() < 0.5 ? -1 : 1;
	}

	reset() {
		const p = this.players[0];
		const s = p.getScreen();
		const b = s.getBall();
		b.setX(s.getWidth() / 2.0 - b.getWidth() / 2.0);
		b.setY(this.rand(s.getHeight()) / 2.0 - b.getY() / 2.0);
		b.setDx(this.randomSign());
		b.setDy(this.randomSign());
	}

	play(socket, down) {
		const i = this.players[0].getSocket() == socket ? 0 : 1;
		const p = this.players[i];
		const s = p.getScreen();
		const paddle = i == 0 ? s.getLeftPaddle() : s.getRightPaddle();
		const y = paddle.getY() + (down ? paddle.getHeight() : -paddle.getHeight());
		const top = s.getLineHeight();																		// Cap paddle vertical position ...................
		const bot = s.getHeight() - paddle.getHeight() - s.getLineHeight() * 4;
		if (y < top)
			paddle.setY(top);
		else if (y > bot)
			paddle.setY(bot);
		else
			paddle.setY(y);
	}

	play_ai(socket) {
		const i = this.players[0].getSocket() == socket ? 0 : 1;
		const p = this.players[i];
		const s = p.getScreen();
		const b = s.getBall();
		const d = i == 0 ? s.getLeftPaddle() : s.getRightPaddle();

		const half = d.getHeight() / 2.0;
		const center = d.getY() + half;
		const screen_center = s.getHeight() / 2.0 - half;
		
		let ball_speed = b.getDy();
		if (ball_speed < 0) {
			ball_speed = -ball_speed;
		}

		if (b.getDx() > 0) {																				// ball moving right...............................

			if (center < screen_center) {																	// return to center position.......................
				d.setY(d.getY() + ball_speed);
			} else {
				d.setY(d.getY() - ball_speed);	
			}
			
		} else {																							// ball moving left................................
		
			if (b.getDy() > 0) {																			// ball moving down................................
				if (b.getY() > center) { 
					d.setY(d.getY() + ball_speed);
				} else {
					d.setY(d.getY() - ball_speed);	
				}
			}
			
			if (b.getDy() < 0) {																			// ball moving up..................................
				if (b.getY() < center) {
					d.setY(d.getY() - ball_speed);
				} else {
					d.setY(d.getY() + ball_speed)
				}
			}

			if (b.getDy() == 0) {																			// ball moving stright across......................
				if (b.getY() < center) {
					d.setY(d.getY() - 5);
				} else {
					d.setY(d.getY() + 5);
				}
			}	 		
		}
	}

	setLayout(socket, raw) {
		const i = this.players[0].getSocket() == socket ? 0 : 1;
		this.players[i] = new Player(socket, raw);
	}

	moveBall() {
		if (!this.isFull())
			return;
		const p1 = this.players[0];
		const p2 = this.players[1];
		const s = p1.getScreen();
		const b = s.getBall();

		b.setX(b.getX() + b.getDx());																		// Moving the ball ................................
		b.setY(b.getY() + b.getDy());
		
		if (b.getX() < 0) {																					// Ball reaches LEFT side of the screen ...........
			p1.setScore(p1.getScore() + 1);
			this.reset();
		} else if (b.getX() > s.getWidth()) {																// Ball reaches RIGHT side of the screen ..........
			p2.setScore(p2.getScore() + 1);
			this.reset();
		} else if (b.getY() < s.getLineHeight() || b.getY() > (s.getHeight() - s.getLineHeight() * 2)) {	// Ball bounces of the TOP or the BOTTOM ..........
			b.setDy(-b.getDy());
		} else {
			const paddle = this.checkPaddleCollisions(s);													// Check paddle collisions ........................
			if (paddle != null) {
				this.changeBallDirection(b);
				this.changeBallAngle(paddle, b);															// Ball bounces in angle and direction ............
			}
		}

		this.send();																						// Refresh UI .....................................

		if (p1.getScore() == MAX_SCORE) {																	// Check scores ...................................
			p1.wins = true;
			p1.getSocket(JSON.stringify({ message: TXT.win }));
			return;
		} else if (p2.getScore() == MAX_SCORE) {
			p2.wins = true;
			p2.getSocket(JSON.stringify({ message: TXT.win }));
			return;
		}

		if (p1.isAi())
			this.play_ai(p1.getSocket());
		if (p2.isAi())
			this.play_ai(p2.getSocket());
		setTimeout(this.moveBall.bind(this), 1);															// Move ball again ................................
	}

	checkPaddleCollisions(screen) {
		const s = screen;
		const ball = s.getBall();
		let paddle = null;

		if (s.getWidth() * 0.1 > ball.getX())
			paddle = s.getLeftPaddle();
		else if (s.getWidth() * 0.9 <  ball.getX())
			paddle = s.getRightPaddle();
		else
			return null;

		let left_a, left_b;
		let right_a, right_b;
		let top_a, top_b;
		let bottom_a, bottom_b;

		left_a = ball.getX();
		right_a = ball.getX() + ball.getWidth();
		top_a = ball.getY();
		bottom_a = ball.getY() + ball.getHeight();

		left_b = paddle.getX();
		right_b = paddle.getX() + paddle.getWidth();
		top_b = paddle.getY();
		bottom_b = paddle.getY() + paddle.getHeight();

		if (left_a > right_b) {
			return null;
		} else if (right_a < left_b) {
			return null;
		} else if (top_a > bottom_b) {
			return null;
		} else if (bottom_a < top_b) {
			return null;
		}

		return paddle;
	}

	changeBallDirection(ball) {
		if (ball.getDx() < 0) {
			ball.setDx(ball.getDx() - 1);
		} else {
			ball.setDx(ball.getDx() + 1);
		}
		ball.setDx(-ball.getDx());
	}

	changeBallAngle(paddle, ball) {
		let hit_pos = paddle.getY() + paddle.getHeight() - ball.getY();

		if (hit_pos >= 0 && hit_pos < 7) {
			ball.setDy(2.5);
		} else if (hit_pos >= 7 && hit_pos < 14) {
			ball.setDy(2);
		} else if (hit_pos >= 14 && hit_pos < 21) {
			ball.setDy(1.5);
		} else if (hit_pos >= 21 && hit_pos < 28) {
			ball.setDy(1);
		} else if (hit_pos >= 28 && hit_pos < 32) {
			ball.setDy(0);
		} else if (hit_pos >= 32 && hit_pos < 39) {
			ball.setDy(-1);
		} else if (hit_pos >= 39 && hit_pos < 46) {
			ball.setDy(-1.5);
		} else if (hit_pos >= 46 && hit_pos < 53) {
			ball.setDy(-2);
		} else if (hit_pos >= 53 && hit_pos <= 60) {
			ball.setDy(-2.5);
		}
	}

}

exports.Pong = Pong;
exports.PongPlayer = Player;
exports.PongTXT = TXT;