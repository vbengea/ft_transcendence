
type Player = {
	"wins": boolean,
	"score": number,
	"screen":{
		"width": number,
		"height": number,
		"ball":{
			"width": number,
			"height": number,
			"x": number,
			"y": number,
			"dx": number,
			"dy": number
		},
		"leftPaddle":{
			"x": number,
			"y": number,
			"width": number,
			"height": number
		},
		"rightPaddle":{
			"x": number,
			"y": number,
			"width": number,
			"height": number
		}
	}
};

type Game = {
	status: number,
	render: number,
	players: Player[]
};

function getLayoutPayloadPong(subtype : string) {
	const BALL : HTMLElement | null = document.querySelector("#ball");
	const LEFT : HTMLElement | null = document.querySelector(`#paddle-left`);
	const RIGHT : HTMLElement | null = document.querySelector(`#paddle-right`);
	const TOPLINE = document.querySelector('#top-white-bar');

	const sc = {
		w: get(document.body, "width"),
		h: get(document.body, "height"),
		lineHeight: get(TOPLINE, "height")
	};

	const paddle = {
		left: {
			x: get(LEFT, "left"),
			y: get(LEFT, "top"),
			w: get(LEFT, "width"),
			h: get(LEFT, "height"),
		},
		right: {
			x: get(RIGHT, "left"),
			y: get(RIGHT, "top"),
			w: get(RIGHT, "width"),
			h: get(RIGHT, "height"),
		},
	};

	const ball = {
		w: get(BALL, "width"),
		h: get(BALL, "height"),
	};

	const profile = JSON.parse(sessionStorage.getItem('TRANSCENDER_USER'));

	return { type: "pong", subtype, paddle, screen: sc, ball, ai: !profile.human };
}

function displayPong(raw: string) {
	const BALL : HTMLElement | null = document.querySelector("#ball");
	const LEFT : HTMLElement | null = document.querySelector(`#paddle-left`);
	const RIGHT : HTMLElement | null = document.querySelector(`#paddle-right`);
	const SCORE_LEFT = document.querySelector(`#score-left`);
	const SCORE_RIGHT = document.querySelector(`#score-right`);
	const data = JSON.parse(raw);
	const game : Game = data.game;
	const side : number = data.side;
	
	if (SCORE_LEFT == null || SCORE_RIGHT == null || BALL == null || LEFT == null || RIGHT == null || !game)
		return;

	let i = 0;
	for (let player of game.players) {
		if (i % 2 == 0)
			SCORE_LEFT.innerHTML = player.score.toString();
		else
			SCORE_RIGHT.innerHTML = player.score.toString();

		if (side == i) {
			LEFT.style.top = `${player.screen.leftPaddle.y}px`;
			RIGHT.style.top = `${player.screen.rightPaddle.y}px`;
			BALL.style.left = `${player.screen.ball.x}px`;
			BALL.style.top = `${player.screen.ball.y}px`;
		}
		i++;
	}
}
