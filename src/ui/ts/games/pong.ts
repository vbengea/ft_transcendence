import { Payload, Data, Game } from '../types';
import { gameLoop } from '../events';
import { get } from './main';

export function getLayoutPayloadPong(subtype : string, tournamentId : string) {
	const BALL : HTMLElement | null = document.querySelector("#ball");
	const LEFT_1 : HTMLElement | null = document.querySelector(`#paddle-left-1`);
	const RIGHT_1 : HTMLElement | null = document.querySelector(`#paddle-right-2`);
	const LEFT_2 : HTMLElement | null = document.querySelector(`#paddle-left-3`);
	const RIGHT_2 : HTMLElement | null = document.querySelector(`#paddle-right-4`);
	const TOPLINE = document.querySelector('#top-white-bar');

	const sc = {
		w: get(document.body, "width"),
		h: get(document.body, "height"),
		lineHeight: get(TOPLINE, "height")
	};

	const paddles = [{
		x: get(LEFT_1, "left"),
		y: get(LEFT_1, "top"),
		w: get(LEFT_1, "width"),
		h: get(LEFT_1, "height"),
	},{
		x: get(RIGHT_1, "left"),
		y: get(RIGHT_1, "top"),
		w: get(RIGHT_1, "width"),
		h: get(RIGHT_1, "height"),
	}]

	if (LEFT_2)
		paddles.push({
			x: get(LEFT_2, "left"),
			y: get(LEFT_2, "top"),
			w: get(LEFT_2, "width"),
			h: get(LEFT_2, "height"),
		})

	if (RIGHT_2)
		paddles.push({
			x: get(RIGHT_2, "left"),
			y: get(RIGHT_2, "top"),
			w: get(RIGHT_2, "width"),
			h: get(RIGHT_2, "height"),
		})

	const ball = {
		w: get(BALL, "width"),
		h: get(BALL, "height"),
	};

	const ret : Payload = { type: "pong", subtype, paddles, screen: sc, ball, tournamentId };

	gameLoop();

	return ret;
}

export function displayPong(data: Data) {
	const BALL : HTMLElement | null = document.querySelector("#ball");
	const LEFT_1 : HTMLElement | null = document.querySelector(`#paddle-left-1`);
	const RIGHT_1 : HTMLElement | null = document.querySelector(`#paddle-right-2`);
	const LEFT_2 : HTMLElement | null = document.querySelector(`#paddle-left-3`);
	const RIGHT_2 : HTMLElement | null = document.querySelector(`#paddle-right-4`);
	const SCORE_LEFT = document.querySelector(`#score-left`);
	const SCORE_RIGHT = document.querySelector(`#score-right`);
	const game : Game = data.game;
	const side : number = data.side;
	
	if (SCORE_LEFT == null || SCORE_RIGHT == null || BALL == null || LEFT_1 == null || RIGHT_1 == null || !game)
		return;

	let n = 0;
	let avatarsLeft = '', namesLeft = '';
	let avatarsRight = '', namesRight = '';
	let scoreRight = '', scoreLeft = '';

	for (let player of game.players) {
		if (player) {
			if (side == n) {
				LEFT_1.style.top = `${player.screen.paddles[0].y}px`;
				RIGHT_1.style.top = `${player.screen.paddles[1].y}px`;
				if (LEFT_2)
					LEFT_2.style.top = `${player.screen.paddles[2].y}px`;
				if (RIGHT_2)
					RIGHT_2.style.top = `${player.screen.paddles[3].y}px`;
				BALL.style.left = `${player.screen.ball.x}px`;
				BALL.style.top = `${player.screen.ball.y}px`;
			}

			const u = player.user;
			let c = 'white';
			if (game.players.length > 2){
				if (n === 0)
					c = 'red-300';
				else if (n == 1)
					c = 'blue-300';
				else if (n == 2)
					c = 'green-300';
				else if (n == 3)
					c = 'yellow-300';
			}
			if (n % 2 == 0) {
				avatarsLeft += ` &nbsp; <img class="w-8 h-8 rounded-full" src="${u.avatar}" alt="${u.name} image"> &nbsp; `;
				namesLeft += `<div class="text-sm text-${c} text-center">${u.name}</div>`;
				scoreLeft = player.score.toString();
			} else {
				avatarsRight += ` &nbsp; <img class="w-8 h-8 rounded-full" src="${u.avatar}" alt="${u.name} image"> &nbsp; `;
				namesRight += `<div class="text-sm text-${c} text-center">${u.name}</div>`;
				scoreRight = player.score.toString();
			}
		}
		n++;
	}

	SCORE_LEFT.innerHTML = `
		<div class="flex justify-center flex-shrink-0">${avatarsLeft}</div>
		<div class="flex-1 min-w-0">
			<p class="text-sm font-medium truncate text-center">${namesLeft}</p>
			<p class="text-white truncate text-center text-7xl">${scoreLeft}</p>
		</div>`

	SCORE_RIGHT.innerHTML = `
		<div class="flex justify-center flex-shrink-0">${avatarsRight}</div>
		<div class="flex-1 min-w-0">
			<p class="text-sm font-medium truncate text-center">${namesRight}</p>
			<p class="text-white truncate text-center text-7xl">${scoreRight}</p>
		</div>`

}
