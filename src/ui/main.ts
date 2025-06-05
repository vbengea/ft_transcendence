const UP_KEYS = ["KeyA", "Keya"];
const DOWN_KEYS = ["KeyZ", "Keyz"];

function get(obj : Element | null, prop : string) {
	if (obj != null)
    	return (obj.getBoundingClientRect() as any)[prop];
}

type Payload = { 
	type: string, 
	subtype: string, 
	paddle?: { 
		left: {
			x: string,
			y: string,
			w: string,
			h: string
		}, 
		right: {
			x: string,
			y: string,
			w: string,
			h: string
		}
	}, 
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
let intervalID;
function play(payload : (a : string) => Payload, display : (a : string) => void, game : string) {
	if (WS != null)
	{
		window.clearInterval(intervalID);
		WS.close();
	}

	const profile = JSON.parse(sessionStorage.getItem('TRANSCENDER_USER'));
	
	WS = new WebSocket(`wss://§{HOST}:§{PORT}/ws`);

	WS.onopen = (event) => {
		WS.send(JSON.stringify(payload("connect")));						// Read game layout ............................................................
	};

	WS.onmessage = (event) => {
		const LOG = document.querySelector(`#log`);
		const SPLASH = document.querySelector(`#splash`);
		const GAME = document.querySelector(`#${game}`);
		const data = JSON.parse(event.data);
		if (data.message){			
			LOG.innerHTML = data.message;
			SPLASH.classList.remove('invisible');
		} else {															// Display game screen .........................................................
			display(event.data);
			SPLASH.classList.add('invisible');
		}
	};

	WS.onerror = (event) => {
		console.log(event)
	}

	addEventListener("resize", (e) => {
		WS.send(JSON.stringify(payload("layout")));							// Read game layout ............................................................
	});

	if (profile.human)
	{
		addEventListener("keydown", (e) => {
			const code = e.code;
			if (UP_KEYS.includes(code) || DOWN_KEYS.includes(code)) {
				WS.send(JSON.stringify({ 
					type: "pong", 
					subtype: "play", 
					isDown: DOWN_KEYS.includes(code) 
				}));
			}
		});

		addEventListener("mouseup", (e) => {
			const target = e.target as HTMLTextAreaElement;
			if(target.tagName == 'TD') {
				WS.send(JSON.stringify({ 
					type: "tictactoe", 
					subtype: "play", 
					isDown: target.id.substring(target.id.indexOf('cell_') + 5) 
				}));
			}
		});
	}
	else if (game === 'pong')
	{
		// intervalID = window.setInterval(myCallback, 10);
		// function myCallback() {
		// 	WS.send(JSON.stringify({ type: "pong", subtype: "play_ai" }));
		// }
	}

}