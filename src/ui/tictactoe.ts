function getLayoutPayloadTicTacToe(subtype : string) {
	const sc = {
		w: get(document.body, "width"),
		h: get(document.body, "height")
	};
	return { type: "tictactoe", subtype, screen: sc };
}

function displayTicTacToe(raw: string) {
	const SCORE_LEFT = document.querySelector(`#score-left`);
	const SCORE_RIGHT = document.querySelector(`#score-right`);
	const MATRIX = document.querySelector(`#tictactoe`);
	const data = JSON.parse(raw);
	const game = data.game;

	if (!game || !game.players)
		return;
	if (SCORE_LEFT == null || SCORE_RIGHT == null || MATRIX == null)
		return;

	let n = 0;
	for (let player of game.players) {
		if (n % 2 == 0)
			SCORE_LEFT.innerHTML = player.score.toString();
		else
			SCORE_RIGHT.innerHTML = player.score.toString();
		n++;
	}

	n = 0;
	for (let i = 0; i < game.matrix.length; i++) {
		for (let j = 0; j < game.matrix[i].length; j++) {
			document.querySelector(`#cell_${n + 1}`).innerHTML = game.matrix[i][j] == '0' ? ' ' : game.matrix[i][j];
			n++;
		}
	}
}
