var WS = null;

function initWebSocket() {
	WS = new WebSocket(`wss://{HOST}:{PORT}/ws`);

	WS.onerror = (event) => {
		console.log(event)
		removeEvents();
	}

	WS.onmessage = async (event) => {
		const data = JSON.parse(event.data);
		if (data.redirect || data.message || data.game)
			handleGame(data);
	};
}

// EVENTS .........................................................................................

const paddleHandler = (e) => {
	const code = e.code;
	if (UP_KEYS.includes(code) || DOWN_KEYS.includes(code)) {
		send(JSON.stringify({ 
			type: "pong", 
			subtype: "play", 
			isDown: DOWN_KEYS.includes(code) 
		}))			
	}
};

const tapHandler = (e) => {
	const target = e.target as HTMLTextAreaElement;
	if(target.tagName == 'TD') {
		send(JSON.stringify({ 
			type: "tictactoe", 
			subtype: "play", 
			isDown: target.id.substring(target.id.indexOf('cell_') + 5) 
		}));
	}
};

const resizeScreen = (e) => {
	send(JSON.stringify(payload("layout")));
};
const handleWheel = (e) => {
	if (e.ctrlKey || e.metaKey) {
		e.preventDefault();
	}
};
const handleKeyDown = (e) => {
	if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-'|| e.key==='=')) {
		e.preventDefault();
	}
};

addEventListener('load', router);
addEventListener('hashchange', router);
addEventListener('wheel', handleWheel);
addEventListener('keydown', handleKeyDown);
addEventListener("keydown", paddleHandler);
addEventListener("mouseup", tapHandler);
addEventListener("resize", resizeScreen);

const removeEvents = () => {
	removeEventListener("keydown", paddleHandler);
	removeEventListener("mouseup", tapHandler);
	removeEventListener("resize", resizeScreen);
}

function testUsers() {
	const username : HTMLInputElement = document.querySelector('#email');
	const password : HTMLInputElement = document.querySelector('#password');

	if (username && password) {
		password.value = '1234';

		if (navigator.userAgent.includes('OPR')){
			username.value = 'unamuno@gmail.com';
		} else if (navigator.userAgent.includes('Firefox')) {
			username.value = 'tolstoi@gmail.com';
		} else if (navigator.userAgent.includes('Chrome')) {
			username.value = 'juaflore@gmail.com';
		} else if (navigator.userAgent.includes('Safari')) {
			username.value = 'edgar@gmail.com';
		}
	}
}

const send = function (message, callback = null) {
	if (!WS)
		return;
    this.waitForConnection(function () {
        WS.send(message);
        if (callback) {
          callback();
        }
    }, 1000);
};

const waitForConnection = function (callback, interval) {
    if (WS.readyState === 1) {
        callback();
    } else {
        var that = this;
        // optional: implement backoff for interval here
        setTimeout(function () {
            that.waitForConnection(callback, interval);
        }, interval);
    }
};