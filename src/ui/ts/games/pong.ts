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

	let i = 0;
	for (let player of game.players) {
		if (player) {
			if (i % 2 == 0)
				SCORE_LEFT.innerHTML = player.score.toString();
			else
				SCORE_RIGHT.innerHTML = player.score.toString();

			if (side == i) {
				LEFT_1.style.top = `${player.screen.paddles[0].y}px`;
				RIGHT_1.style.top = `${player.screen.paddles[1].y}px`;
				if (LEFT_2)
					LEFT_2.style.top = `${player.screen.paddles[2].y}px`;
				if (RIGHT_2)
					RIGHT_2.style.top = `${player.screen.paddles[3].y}px`;
				BALL.style.left = `${player.screen.ball.x}px`;
				BALL.style.top = `${player.screen.ball.y}px`;
			}
		}
		i++;
	}
}
