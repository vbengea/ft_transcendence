
export type Message = { 
	id: string, 
	name: string, 
	avatar: string, 
	email: string, 
	count: number, 
	text?: string,
	blocked?: boolean,
	sender?: { id: string, avatar: string, name: string } 
};

export interface Window {
	google?: {
		accounts: {
			id: {
				initialize: (config: { client_id: string, callback: (response: { credential: string }) => void }) => void;
				prompt: () => void;
			}
		}
	}
}

export type Payload = { 
	type: string, 
	subtype: string,
	tournamentId : string,
	paddles?:{
		x: number,
		y: number,
		w: number,
		h: number
	}[],
	screen: { 
		w: number, 
		h: number, 
		lineHeight?: number 
	}, 
	ball?: {
		w: number, 
		h: number 
	}
};

export type Player = {
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
		"paddles":{
			"x": number,
			"y": number,
			"width": number,
			"height": number
		} []
	}
};

export type Game = {
	status: number,
	render: number,
	players: Player[],
	matrix: string[][]
};

export type DisplayFn = (a : Data) => void;
export type PayloadFn = (a : string, tournamentId : string) => Payload
export type Data = { game: Game, side: number, redirect: string, message: string, match: { counter: number } };
