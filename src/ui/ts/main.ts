const UP_KEYS = ["KeyA", "Keya"];
const DOWN_KEYS = ["KeyZ", "Keyz"];

function get(obj : Element | null, prop : string) {
	if (obj != null)
    	return (obj.getBoundingClientRect() as any)[prop];
}

type Payload = { 
	type: string, 
	subtype: string, 
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

type DisplayFn = (a : Data) => void;
type PayloadFn = (a : string) => Payload
type Data = { game: Game, side: number, redirect: string, message: string, match: { counter: number } };

let display : DisplayFn = null;
let payload : PayloadFn = null

function play(payloadfn : PayloadFn, displayfn : DisplayFn, game : string) {
	display = displayfn;
	payload = payloadfn;
	send(JSON.stringify(payload("connect")));
}

async function handleGame(data: Data){
	const SPLASH = document.querySelector(`#splash`);
	if (data.redirect) {
		location.hash = data.redirect;
	} else if (data.message){
		if (SPLASH) {
			SPLASH.innerHTML = await (await fetch(`./pages/vs.html`)).text();
			SPLASH.classList.remove('invisible');
			const LOG = document.querySelector(`#messanger`);
			if (LOG)		
				LOG.innerHTML = data.message;
			for (let i = 1; i <= 4; i++){
				const img : HTMLImageElement = document.querySelector(`#user-${i}-img`);
				const txt : HTMLImageElement = document.querySelector(`#user-${i}-name`);
				if (data.match.counter >= i){
					img.src = data.match[`user${i}`].avatar;
					txt.innerHTML = data.match[`user${i}`].name;
				} else {
					img.parentElement.classList.add('hidden');
				}
			}
		}
	} else if (data.game) {																// Display game screen .........................................................
		display(data);
		if (SPLASH)
			SPLASH.classList.add('invisible');
	}
}