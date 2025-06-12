const prisma = require('../prisma/prisma.cjs');
const tournamentSrv = require('../tournament/services/tournament.service')(prisma);
const MAX_SCORE = 10;

const TXT = {
	success:  "",
	waiting: "Waiting for a peer to connect.",
	giveup: "You win. the other player just gave up!",
	win: "#/landing/win",
	loose: "#/landing/loose"
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
		this.paddles = [];
		for (let p of raw.paddles)
			this.paddles.push(new Paddle(p));
	}
	
	getBall() {
		return this.ball;
	}

	getPaddle(i) {
		return this.paddles[i];
	}

	getPaddles() {
		return this.paddles;
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

	constructor (user) {
		this.wins = false;
		this.screen = new Screen(user.raw);
		this.score = 0;
		this.ai = !user.human;
		this.user = user;
		this.side = 0;
		this.segment = 0;
		this.paddleIndex = 0;
	}

	getPaddleIndex() {
		return this.paddleIndex;
	}

	getSide() {
		return this.side;
	}

	setSide(side) {
		this.side = side;
	}

	getSegment() {
		return this.segment;
	}

	setSegment(segment) {
		this.segment = segment;
	}

	getUser() {
		return this.user;
	}

	getSocket() {
		return this.user.socket;
	}

	getScreen() {
		return this.screen;
	}

	setScreen(raw) {
		this.screen = new Screen(user.raw);
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

	constructor(mid, limit) {
		this.status = 0;
		this.render = 0;
		this.players = [];
		this.mid = mid;
		this.limit = limit;
		this.paddleLeftCounter = 0;
		this.paddleRightCounter = 0;
		this.paddleCounter = 0;
	}

	start() {
		tournamentSrv.startMatch(this.mid);
		this.status = 1;
		this.reset();
		this.moveBall();
	}

	getFirstNonComputerPlayer() {
		for(let p of this.players){
			if (p.getUser().human)
				return p;
		}
	}

	send() {
		const u1 = this.getFirstNonComputerPlayer();
		const s1 = u1.getScreen();
		const b1 = s1.getBall();
		const p1s = s1.getPaddles();
		const so1 = u1.getSocket();
		const sos = new Map();

		if (so1)
			sos.set(so1, u1.getSide());
			
		let i = 0;
		for(let p of this.players){
			if (p.getUser().id !== u1.getUser().id) {
				const s2 = p.getScreen();
				const b2 = s2.getBall();

				const wRatio = s2.getWidth() / s1.getWidth();
				const hRatio = s2.getHeight() / s1.getHeight();

				b2.setX(b1.getX() * wRatio);
				b2.setY(b1.getY() * hRatio);

				const paddles = s2.getPaddles();
				const index = p.getPaddleIndex();

				p1s[index].setY(paddles[index].getY() / hRatio);

				const so = p.getSocket();
				if (so)
					sos.set(so, p.getSide());
			}
			i++;
		}

		const json = JSON.stringify(this);
		
		for (let [so, side] of sos.entries()) {
			so.send("{ \"game\": " + json + ", \"side\": " + side + " }");
		}
	}

	addPlayer(player) {
		player.setSide(this.players.length % 2);
		if (this.players.length % 2 == 0)
			player.setSegment(this.paddleLeftCounter++);
		else
			player.setSegment(this.paddleRightCounter++);
		player.paddleIndex = this.paddleCounter++;
		this.players.push(player);
		if (this.players.length == this.limit) {
			for(let p of this.players) {
				if (p.getSocket())
					p.getSocket().send(JSON.stringify({ message: TXT.success }));
			}
			this.start();
		}
	}

	rand(max) {
		return Math.floor(Math.random() * max);
	}

	randomSign() {
		return Math.random() < 0.5 ? -1 : 1;
	}

	reset() {
		const p = this.getFirstNonComputerPlayer();
		const s = p.getScreen();
		const b = s.getBall();
		b.setX(s.getWidth() / 2.0 - b.getWidth() / 2.0);
		b.setY(this.rand(s.getHeight()) / 2.0 - b.getY() / 2.0);
		b.setDx(this.randomSign());
		b.setDy(this.randomSign());
	}

	play(p, down) {
		const s = p.getScreen();
		const index = p.getPaddleIndex();
		const paddle = s.getPaddles()[index];
		const y = paddle.getY() + (down ? paddle.getHeight() : -paddle.getHeight());
		this.cap(p, y);
	}

	cap(p, y) {
		const s = p.getScreen();
		const index = p.getPaddleIndex();
		const paddle = s.getPaddles()[index];
		const count = this.paddleCounter / 2.0;
		const height = s.getHeight() / (count);		
		const gap = 30;
		const ph = paddle.getHeight() + gap;
		const bot = height * ((index / 2) + 1) - ph;
		const top = bot - height + ph + gap / 3;															// Cap paddle vertical position ...................
		if (y < top)
			paddle.setY(top);
		else if (y > bot)
			paddle.setY(bot);
		else
			paddle.setY(y);
	}

	computer(player, ball) {
		const gap = 30;
		const p = player;
		const s = p.getScreen();
		const b = ball;																						// ball moving from 1p ............................
		const d = s.getPaddles()[p.getPaddleIndex()];

		const half = d.getHeight() / 2.0;
		const center = d.getY() + half;
		const screen_center = s.getHeight() / 2.0 - half;
		
		let ball_speed = b.getDy();
		if (ball_speed < 0) {
			ball_speed = -ball_speed;
		}

		let y = 0;
		if (p.getSide() == 0) {
			y = this.computerLeft(b, d, ball_speed, center, screen_center);
		} else {
			y = this.computerRight(b, d, ball_speed, center, screen_center);
		}

		this.cap(p, y);
	}

	computerLeft(b, d, ball_speed, center, screen_center) {
		let y = 0;
		if (b.getDx() > 0) {																				// ball moving right...............................
			if (center < screen_center) {																	// return to center position.......................
				y = d.getY() + ball_speed;
			} else {
				y = d.getY() - ball_speed;
			}

		} else {																							// ball moving left................................
			if (b.getDy() > 0) {																			// ball moving down................................
				if (b.getY() > center) { 
					y = d.getY() + ball_speed;
				} else {
					y = d.getY() - ball_speed;
				}
			}
			
			if (b.getDy() < 0) {																			// ball moving up..................................
				if (b.getY() < center) {
					y = d.getY() - ball_speed;
				} else {
					y = d.getY() + ball_speed;
				}
			}

			if (b.getDy() == 0) {																			// ball moving stright across......................
				if (b.getY() < center) {
					y = d.getY() - 5;
				} else {
					y = d.getY() + 5;
				}
			}
		}
		return y;
	}

	computerRight(b, d, ball_speed, center, screen_center) {
		let y = 0;
		if (b.getDx() > 0) {											
			if (b.getDy() > 0) {																	
				if (b.getY() > center) { 
					y = d.getY() + ball_speed;
				} else {
					y = d.getY() - ball_speed;
				}
			}
			
			if (b.getDy() < 0) {																			// ball moving up..................................
				if (b.getY() < center) {
					y = d.getY() - ball_speed;
				} else {
					y = d.getY() + ball_speed;
				}
			}

			if (b.getDy() == 0) {																			// ball moving stright across......................
				if (b.getY() < center) {
					y = d.getY() - 5;
				} else {
					y = d.getY() + 5;
				}
			}

		} else {																							// ball moving left................................
			if (center < screen_center) {																	// return to center position.......................
				y = d.getY() + ball_speed;
			} else {
				y = d.getY() - ball_speed;
			}
		}
		return y;
	}

	moveBall() {
		const p1 = this.getFirstNonComputerPlayer();
		const p2 = this.players[1];
		const s = p1.getScreen();
		const b = s.getBall();

		b.setX(b.getX() + b.getDx());																		// Moving the ball ................................
		b.setY(b.getY() + b.getDy());
		
		if (b.getX() < 0) {																					// Ball reaches LEFT side of the screen ...........
			for(let p of this.players) {
				if (p.getSide() === 1)
					p.setScore(p.getScore() + 1);
			}
			this.reset();
		} else if (b.getX() > s.getWidth()) {																// Ball reaches RIGHT side of the screen ..........
			for(let p of this.players) {
				if (p.getSide() === 0)
					p.setScore(p.getScore() + 1);
			}
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

		if (p1.getScore() == MAX_SCORE) {																	// Check scores ...................................
			tournamentSrv.endMatch(this.mid, p1.getScore(), p2.getScore());

			for(let p of this.players) {
				if (p.getSide() === 0) {
					p.wins = true;
					const s1 = p.getSocket();
					if (s1)
						s1.send(JSON.stringify({ redirect: TXT.win }));
				} else {
					p.wins = false;
					const s2 = p.getSocket();
					if (s2)
						s2.send(JSON.stringify({ redirect: TXT.loose }));
				}
			}

		} else if (p2.getScore() == MAX_SCORE) {
			tournamentSrv.endMatch(this.mid, p1.getScore(), p2.getScore());

			for(let p of this.players) {
				if (p.getSide() === 0) {
					p.wins = false;
					const s1 = p.getSocket();
					if (s1)
						s1.send(JSON.stringify({ redirect: TXT.loose }));
				} else {
					p.wins = true;
					const s2 = p.getSocket();
					if (s2)
						s2.send(JSON.stringify({ redirect: TXT.win }));
				}
			}

		} else {
			for(let p of this.players)
				if (!p.getUser().human)
					this.computer(p, b);
			this.send();																					// Refresh UI .....................................
			setTimeout(this.moveBall.bind(this), 1);														// Move ball again ................................
		}
	}

	checkPaddleCollisions(screen) {
		const s = screen;
		const ball = s.getBall();
		let padd = null;

		let left_a, left_b;
		let right_a, right_b;
		let top_a, top_b;
		let bottom_a, bottom_b;

		left_a = ball.getX();
		right_a = ball.getX() + ball.getWidth();
		top_a = ball.getY();
		bottom_a = ball.getY() + ball.getHeight();

		const paddles = s.getPaddles();
		const ps = [];
		if (s.getWidth() * 0.1 > ball.getX()) {
			for (let i = 0; i < paddles.length; i++){
				if (i % 2 === 0)
					ps.push(paddles[i]);
			}
		} else if (s.getWidth() * 0.9 <  ball.getX()) {
			for (let i = 0; i < paddles.length; i++){
				if (i % 2 !== 0)
					ps.push(paddles[i]);
			}
		} else {
			return null;
		}

		for (let paddle of ps) {
			left_b = paddle.getX();
			right_b = paddle.getX() + paddle.getWidth();
			top_b = paddle.getY();
			bottom_b = paddle.getY() + paddle.getHeight();

			if (left_a > right_b) {																				// LHS: Ball left edge passed paddle right edge ...
				
			} else if (right_a < left_b) {																		// RHS: Ball right edge passed paddle left edge ...
				
			} else if (top_a > bottom_b) {																		// Ball top edge lower than paddle bottom edge ....
				
			} else if (bottom_a < top_b) {																		// Ball bottom edge higher than paddle top edge ...
				
			} else {
				padd = paddle;
				break;
			}
		}

		return padd;
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