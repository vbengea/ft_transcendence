import { Data } from '../types';
import { get } from './main';

export function getLayoutPayloadTicTacToe(subtype : string, tournamentId : string, tournamnent: { id }) {
	const sc = {
		w: get(document.body, "width"),
		h: get(document.body, "height")
	};
	return { type: "tictactoe", subtype, screen: sc, tournamentId };
}

export function displayTicTacToe(data: Data) {
	const SCORE_LEFT = document.querySelector(`#score-left`);
	const SCORE_RIGHT = document.querySelector(`#score-right`);
	const MATRIX = document.querySelector(`#tictactoe`);
	const game = data.game;

	if (!game || !game.players)
		return;
	if (SCORE_LEFT == null || SCORE_RIGHT == null || MATRIX == null)
		return;

	let n = 0;
	for (let player of game.players) {
		if (player) {
			const u = player.user;
			if (n % 2 == 0) {
				SCORE_LEFT.innerHTML = `
					<div class="flex justify-center flex-shrink-0">
						<img class="w-8 h-8 rounded-full" src="${u.avatar}" alt="${u.name} image">
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 truncate text-center">${u.name}</p>
						<p class="text-red-500 truncate text-center text-7xl">${player.score.toString()}</p>
					</div>`
			} else {
				SCORE_RIGHT.innerHTML = `
					<div class="flex justify-center flex-shrink-0">
						<img class="w-8 h-8 rounded-full" src="${u.avatar}" alt="${u.name} image">
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 truncate text-center">${u.name}</p>
						<p class="text-red-500 truncate text-center text-7xl">${player.score.toString()}</p>
					</div>`
			}
		}
		n++;
	}

	n = 0;
	for (let i = 0; i < game.matrix.length; i++) {
		for (let j = 0; j < game.matrix[i].length; j++) {
			const el : HTMLElement = document.querySelector(`#cell_${n + 1}`);
			const html = game.matrix[i][j] == '0' ? ' ' : game.matrix[i][j];
			el.innerHTML = html;
			n++;
		}
	}
}
