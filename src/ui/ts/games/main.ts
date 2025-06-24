import { DisplayFn, PayloadFn, Data } from '../types';
import { send, lang } from '../events';

export function get(obj : Element | null, prop : string) {
	if (obj != null)
    	return (obj.getBoundingClientRect() as any)[prop];
}

let display : DisplayFn = null;
let payload : PayloadFn = null

export async function play(payloadfn : PayloadFn, displayfn : DisplayFn, game : string, tournamentId: string) {
	display = displayfn;
	payload = payloadfn;
	const t = await (await fetch(`/api/tournament/${tournamentId}`)).json();
	send(JSON.stringify(payload("connect", tournamentId, t)));
}

export async function handleGame(data: Data){
	const SPLASH = document.querySelector(`#splash`);
	document.querySelector('#giveup').classList.add('hidden');
	if (data.redirect) {
		location.hash = data.redirect;
	} else if (data.message){
		if (SPLASH) {
			SPLASH.innerHTML = lang(await (await fetch(`./pages/vs.html`)).text());
			SPLASH.classList.remove('invisible');
			const LOG = document.querySelector(`#messanger`);
			if (LOG)		
				LOG.innerHTML = lang(data.message);
			for (let i = 1; i <= 4; i++){
				const img : HTMLImageElement = document.querySelector(`#user-${i}-img`);
				const txt : HTMLImageElement = document.querySelector(`#user-${i}-name`);
				if (data.match.counter >= i){
					const u = data.match[`user${i}`];
					img.src = u.avatar;
					txt.innerHTML = lang(u.alias || u.name);
				} else {
					img.parentElement.classList.add('hidden');
				}
			}
		}
	} else if (data.game) {																// Display game screen .........................................................
		document.querySelector('#giveup').classList.remove('hidden');
		
		display(data);
		if (SPLASH)
			SPLASH.classList.add('invisible');
	}
}