var WS = null;

type Message = { 
	id: string, 
	name: string, 
	avatar: string, 
	email: string, 
	count: number, 
	text?: string, 
	sender?: { id: string, avatar: string, name: string } 
};

let chatUserList : Message[] = [];
let chatUserMessages : Message[] = [];
let receiverId : String;

const CHAR_LIMIT = 255;

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
		else if (data.type === 'chat') {
			if (data.count){
				const el = document.querySelector('#message_count');
				let n = parseInt(el.innerHTML) || 0;
				n++;
				el.innerHTML = n + '';
			}
			if (data.sender) {
				let u: Message = chatUserList.filter(c => c.id === data.sender.id)[0];
				if (u) {
					u.count += 1;
				} else {
					const { id, avatar, name, email } = data.sender;
					chatUserList.push({ id, avatar, name, email, count: 1 })
				}
				processChatUserList();
			}
			if (data.text) {
				chatUserMessages.push(data);
				processUserMessages();
			}
		}
	};
}

// EVENTS .........................................................................................

const processChatUserList = () => {
	const user = JSON.parse(localStorage.TRANSCENDER_USER).user;

	const el = document.querySelector('#chat');
	if (el) {
		if (chatUserList.length) {

			el.innerHTML = chatUserList.filter(r => r.id !== user.id).map(u => `
				<li class="cursor-pointer pt-3 p-5 sm:pt-4" data-friend_element="${u.id}">
					<div class="flex items-center space-x-4" data-friend_element="${u.id}">
						<div class="flex-shrink-0" data-friend_element="${u.id}">
							<img class="w-8 h-8 rounded-full" src="${u.avatar}" alt="${u.name} image" data-friend_element="${u.id}">
						</div>
						<div class="flex-1 min-w-0" data-friend_element="${u.id}">
							<p class="text-sm font-medium text-gray-900 truncate" data-friend_element="${u.id}">${u.name}</p>
							<p class="text-sm text-gray-500 truncate dark:text-gray-400" data-friend_element="${u.id}">${u.email}</p>
						</div>
						<span class="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-white bg-red-400 rounded-full" data-friend_element="${u.id}">${u.count || ''}</span>

						<button data-friend_menu="${u.id}" data-dropdown-toggle="dropdownDots" data-dropdown-placement="bottom-start" class="inline-flex self-center items-center m-0 p-0 text-sm font-medium text-center text-gray-900 bg-white" type="button">
							<svg data-friend_menu="${u.id}" class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
								<path data-friend_menu="${u.id}" d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
							</svg>
						</button>
						<div id="${u.id}" data-friend_option="0" class="absolute z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40">
							<ul data-friend_option="999" class="py-2 text-sm text-gray-700 " aria-labelledby="dropdownMenuIconButton">
								<li data-friend_option="1" class="px-4 py-2">Block</li>
								<li data-friend_option="2" class="px-4 py-2">Invite to play</li>
							</ul>
						</div>

					</div>
				</li>
			`).join('');
		} else {
			el.innerHTML = '';
		}
	}
};

const processUserMessages = () => {
	const user = JSON.parse(localStorage.TRANSCENDER_USER).user;

	const el = document.querySelector('#chat');
	if (el) {
		let html = `
		<div class="flex flex-col h-full" data-chat="1">
			<div class="flex items-center justify-between p-2 bg-gray-100" data-chat="1">
				<svg class="cursor-pointer w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-friend_back="${receiverId}">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" data-friend_back="${receiverId}"></path>
				</svg>
			</div>
			<div id="scroller" class="flex flex-col flex-1 p-5 overflow-y-auto scroll-auto" data-chat="1">`;

		if (chatUserMessages.length) {
			html += chatUserMessages.map(u => {
				const me = user.id === u.sender.id;

				const img = `<img class="w-8 h-8 rounded-full" src="${u.sender.avatar}" alt="${u.sender.name} image" data-chat="1">`;

				const bubble = `
				<div class="flex flex-col gap-1 w-full max-w-[320px] mb-5" data-chat="1">
					<div class="flex items-center space-x-2 rtl:space-x-reverse" data-chat="1">
						<span class="text-sm font-semibold text-gray-900" data-chat="1">${u.sender.name}</span>
					</div>
					<div class="flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-xl dark:bg-${me ? "gray-700" : "blue-600"}" data-chat="1">
						<p class="text-xs font-normal text-gray-900 dark:text-white" data-chat="1">${u.text}</p>
					</div>
				</div>`;

				return `
					<div class="flex items-start gap-2.5" data-chat="1">
						${me ? (img + bubble) : (bubble + img)}
					</div>
				`
			}).join('');
		}

		html += `
			</div>

			<form data-chat="1" class="border-t-gray-300">
				<div class="flex items-center py-2 pr-0 bg-white" data-chat="1">
					<input autofocus type="text" id="text" rows="1" class="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white border border-gray-300 placeholder="Your message..." data-chat="1" />
					<button type="button" class="inline-flex justify-center p-2 mr-3 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
						<svg id="sendbtn" class="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
							<path id="sendpath" d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
						</svg>
						<span class="sr-only" data-chat="1">Send message</span>
					</button>
				</div>
			</form>

		</div>
		`;

		el.innerHTML = html;

		const sc = document.querySelector("#scroller");
		const tx: HTMLInputElement = document.querySelector("#text");
		if (sc) {
			sc.scrollTo(0, el.scrollHeight + 100);
			if (tx) {
				tx.focus();
			}
		}
	};
}

const changeMode = async (mode, friendId?) => {
	chatUserMessages = [];
	chatUserList = [];

	const ct = document.querySelector('#message_count');
	if (ct)
		ct.innerHTML = '';

	if (mode === "count"){
		if (ct) {
			const count = await (await fetch("/auth/new_message_count")).text();
			if (count != '0') {
				ct.innerHTML = count;
			} else {
				ct.innerHTML = '';
			}
		}

	} else if (mode === "list") {
		chatUserList = await (await fetch("/auth/new_message_count_per_user")).json();
		processChatUserList();

	} else if (mode === "friend") {
		chatUserMessages = await (await fetch(`/auth/messages/${friendId}`)).json();
		processUserMessages();
	}

	send(JSON.stringify({ 
		type: "chat", 
		subtype: "mode", 
		mode,
		friendId,
		user: JSON.parse(localStorage.TRANSCENDER_USER).user
	}));
};

const sendMessage = () => {
	const el : HTMLInputElement = document.querySelector('#text');
	const text = el.value.slice(0, CHAR_LIMIT);
	el.value = '';
	send(JSON.stringify({ type: "chat", subtype: "send", receiverId, text }));
}

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
	if (payload)
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

const keyHandler = (e) => {
	if (e.code == 'Enter' && e.target.id === 'text') {
		sendMessage();
	}
};

const clickHandler = (e) => {
	const target : HTMLElement = e.target;
	let id = target.id;
	const chat = document.querySelector("#chat");
	const bypass = ["user", "user_inner_1", "user_inner_2", "user_inner_3"];
	const menu = document.querySelector("#menu");
	
	if (target.dataset.friend_back)
		id = "messages_btn";
	else if (target.dataset.friend_element)
		id = "friend_element";
	else if (target.dataset.friend_menu)
		id = "friend_menu";
	else if (target.dataset.friend_option)
		id = "friend_option";
	else if (target.dataset.chat)
		id = "chat";

	if(menu && !bypass.includes((e.target as HTMLElement).id))
		menu.classList.add('hidden');

	const dots_ = document.querySelector('[data-friend_option="0"]');
	if (dots_)
		dots_.classList.add("hidden")

	switch(id) {
		case "messages_btn": case "messages_svg": case "messages_path": case "message_count":
			if (chat)
				chat.classList.remove('hidden');
			changeMode("list");
			break;
		case "friend_element":
			receiverId = target.dataset.friend_element;
			changeMode("friend", target.dataset.friend_element);
			break;
		case "friend_menu":
			const dots = document.querySelector(`#${target.dataset.friend_menu}`);
			if (dots){
				dots.classList.remove("hidden");
			}
			break;
		case "friend_option":
			break;
		case "chat":
			break;
		case "sendbtn": case "sendpath":
			sendMessage();
			break;
		default:
			if (chat)
				chat.classList.add("hidden");
			changeMode("count");
			break;
	}
};

addEventListener('load', router);
addEventListener('hashchange', router);
addEventListener('wheel', handleWheel);
addEventListener('keydown', handleKeyDown);
addEventListener("keydown", paddleHandler);
addEventListener("mouseup", tapHandler);
addEventListener("resize", resizeScreen);
addEventListener("click", clickHandler);
addEventListener("keyup", keyHandler);

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