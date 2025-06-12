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

let WS = null;
function play(payload : (a : string) => Payload, display : (a : string) => void, game : string) {
	if (WS != null)
		WS.close();

	const paddleHandler = (e) => {
		const code = e.code;
		if (UP_KEYS.includes(code) || DOWN_KEYS.includes(code)) {
			if (WS) {
				WS.send(JSON.stringify({ 
					type: "pong", 
					subtype: "play", 
					isDown: DOWN_KEYS.includes(code) 
				}));
			}				
		}
	};

	const tapHandler = (e) => {
		const target = e.target as HTMLTextAreaElement;
		if(target.tagName == 'TD') {
			WS.send(JSON.stringify({ 
				type: "tictactoe", 
				subtype: "play", 
				isDown: target.id.substring(target.id.indexOf('cell_') + 5) 
			}));
		}
	};

	removeEventListener("keydown", paddleHandler);
	removeEventListener("mouseup", paddleHandler);
	
	WS = new WebSocket(`wss://{HOST}:{PORT}/ws`);

	WS.onopen = (_event) => {
		if (WS)
			WS.send(JSON.stringify(payload("connect")));						// Read game layout ............................................................
	};

	WS.onmessage = async (event) => {
		const data = JSON.parse(event.data);
		const SPLASH = document.querySelector(`#splash`);
		if (data.redirect) {
			WS.close();
			WS = null;
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
		} else {															// Display game screen .........................................................
			display(event.data);
			if (SPLASH)
				SPLASH.classList.add('invisible');
		}
	};

	WS.onerror = (event) => {
		console.log(event)
	}

	addEventListener("resize", (e) => {
		if (WS)
			WS.send(JSON.stringify(payload("layout")));							// Read game layout ............................................................
	});

	addEventListener("keydown", paddleHandler);
	addEventListener("mouseup", tapHandler);

}