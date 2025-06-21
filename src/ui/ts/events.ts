import { Message } from './types';
import { handleGame } from './games/main';
import { getLayoutPayloadPong } from './games/pong';
import { getLayoutPayloadBong } from './games/bong';
import { getLayoutPayloadTicTacToe } from './games/tictactoe';

export let WS = null;

let chatUserList : Message[] = [];
let chatUserMessages : Message[] = [];
let receiverId : String;

const CHAR_LIMIT = 255;
const ANONYMOUS = "anonymous@gmail.com"

export const lang = (html) => {
	if (sessionStorage.langRaw) {
		const translate = JSON.parse(sessionStorage.langRaw)[0];
		let arr;
		const reg = /\{\{(.*?)\}\}/g;
		while ((arr = reg.exec(html)) !== null)
			html = html.replace(arr[0], translate[arr[1]]);
	}
	return html;
};

export const loadLang = async () => {
	const lang = sessionStorage.lang || "en_EN";
	const raw = await fetch(`/languages/${lang}.json`);
	sessionStorage.langRaw = await raw.text();
}

loadLang();

export function closeWS() {
	WS.close();
	WS = null;
}

export function initWebSocket() {

	WS = new WebSocket(`https://${window.location.host}/ws`);
	
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
				let n = lang(parseInt(el.innerHTML) || 0);
				n++;
				el.innerHTML = lang(n + '');
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
		} else if (data.type === 'logout'){
			location.hash = '#/logout';
		}
	};
}

export const createTournament = async (tournament) => {
	const uid = JSON.parse(sessionStorage.TRANSCENDER_USER).user.id;
	const gameName = tournament.gameType;

	const tournamentData = {
		...tournament,
		gameName: gameName,
	};

	const t = await (await fetch('/api/tournament', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(tournamentData)
	})).json();

	for(let u of tournament.users){
		if (u.human && u.id !== uid)
			tournamentChat(tournament.gameType, u.id, t.tournamentId, t.totalRounds > 1 ? t.name : null);
	}

	location.hash = `#/landing/${tournament.gameType}/${t.tournamentId}`;
};

const tournamentChat = (game, receiverId, tournamentId, tname?) => {
	let text = '';
	if (tname) {
		const start = `<button type="button" data-link="#/landing/${game}/${tournamentId}" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Start</button>`;
		text = `Your first game of the ${tname} tournament is ready to ${start}`;
	} else {
		text = `<button type="button" data-link="#/landing/${game}/${tournamentId}" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Play ${game}?</button>`;
	}
	WS.send(JSON.stringify({ type: "chat", subtype: "send", text, receiverId, game }));
}

const processChatUserList = () => {
	const user = JSON.parse(sessionStorage.TRANSCENDER_USER).user;

	const el = document.querySelector('#chat');
	if (el) {
		if (chatUserList.length) {
			chatUserList.sort((a, b) => {
				return b.count - a.count;
			});
			el.innerHTML = lang(chatUserList.filter(r => r.id !== user.id && r.email !== ANONYMOUS).map(u => `
				<li class="cursor-pointer pt-3 p-5 sm:pt-4 ${u.blocked ? 'bg-red-300' : ''}" data-friend_element="${u.id}">
					<div class="flex items-center space-x-4" data-friend_element="${u.id}">
						<div class="flex-shrink-0" data-friend_element="${u.id}">
							<img class="w-8 h-8 rounded-full" src="${u.avatar}" alt="${u.name} image" data-friend_element="${u.id}">
						</div>
						<div class="flex-1 min-w-0" data-friend_element="${u.id}">
							<p class="text-sm font-medium text-gray-900 truncate" data-friend_element="${u.id}">${u.name}</p>
							<p class="text-sm ${u.blocked ? 'text-gray-700' : 'text-gray-500'} truncate" data-friend_element="${u.id}">${u.email}</p>
						</div>

						<span class="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-white ${u.count ? 'bg-red-400' : ''} rounded-full" data-friend_element="${u.id}">${u.count || ''}</span>

						<button data-friend_menu="${u.id}" data-dropdown-toggle="dropdownDots" data-dropdown-placement="bottom-start" class="cursor-pointer inline-flex self-center items-center m-0 p-0 text-sm font-medium text-center text-gray-900 bg-transparent" type="button">
							<svg data-friend_menu="${u.id}" class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
								<path data-friend_menu="${u.id}" d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
							</svg>
						</button>
						<div id="${u.id}" data-friend_option="0" class="absolute ml-20 mt-20 z-10 hidden bg-white divide-y divide-gray-300 rounded-lg shadow-lg w-40">
							<ul data-friend_option="999" class="py-2 text-sm text-gray-700 " aria-labelledby="dropdownMenuIconButton">
								<li data-friend_option="block" data-friend_id="${u.id}" class="px-4 py-2">{{block}}</li>
								<li data-friend_option="pong" data-friend_id="${u.id}" data-friend_name="${u.name}" data-friend_avatar="${u.avatar}" class="px-4 py-2">{{play}} Pong?</li>
								<li data-friend_option="bong" data-friend_id="${u.id}" data-friend_name="${u.name}" data-friend_avatar="${u.avatar}" class="px-4 py-2">{{play}} Bong?</li>
								<li data-friend_option="tictactoe" data-friend_id="${u.id}" data-friend_name="${u.name}" data-friend_avatar="${u.avatar}" class="px-4 py-2">{{play}} 
								{{tictactoe}}?</li>
								<li data-friend_option="profile" data-friend_id="${u.id}" class="px-4 py-2">{{view_profile}}</li>
							</ul>
						</div>

					</div>
				</li>
			`).join(''));
		} else {
			el.innerHTML = '';
		}
	}
};

const processUserMessages = () => {
	const user = JSON.parse(sessionStorage.TRANSCENDER_USER).user;

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
					<button id="sendwrap" type="button" class="inline-flex justify-center p-2 mr-3 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
						<svg id="sendbtn" class="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
							<path id="sendpath" d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
						</svg>
						<span class="sr-only" data-chat="1">Send message</span>
					</button>
				</div>
			</form>

		</div>
		`;

		el.innerHTML = lang(html);
		scrollToBottom();
	};
}

const scrollToBottom = () => {
	const sc = document.querySelector("#scroller");
	const tx: HTMLInputElement = document.querySelector("#text");
	if (sc) {
		sc.scrollTo(0, sc.scrollHeight);
		if (tx) {
			tx.focus();
		}
	}
};

export const changeMode = async (mode, friendId?) => {
	chatUserMessages = [];
	chatUserList = [];

	const ct = document.querySelector('#message_count');
	if (ct)
		ct.innerHTML = '';

	if (mode === "count"){
		if (ct) {
			const count = await (await fetch("/auth/new_message_count")).text();
			if (count != '0') {
				ct.innerHTML = lang(count);
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

	try {
		if (sessionStorage.TRANSCENDER_USER) {
			send(JSON.stringify({ 
				type: "chat", 
				subtype: "mode", 
				mode,
				friendId,
				user: JSON.parse(sessionStorage.TRANSCENDER_USER).user
			}));
		}
	} catch( err ){
		
	}
};

const sendMessage = () => {
	const el : HTMLInputElement = document.querySelector('#text');
	const text = el.value.slice(0, CHAR_LIMIT);
	if (text.length) {
		el.value = '';
		send(JSON.stringify({ type: "chat", subtype: "send", receiverId, text }));
	}
}

const paddleHandler = (e) => {
	keys[e.code] = true;
};

const paddleUpHandler = (e) => {
	delete keys[e.code];
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

const resizeScreen = async (e) => {
	const [_, _landing, game, tournamentId] = location.hash.slice(1).split('/');
	if (tournamentId) {
		const t = await (await fetch(`/api/tournament/${tournamentId}`)).json();
		if (game === 'pong')
			send(JSON.stringify(getLayoutPayloadPong("layout", tournamentId, t)));
		else if (game === 'tictactoe')
			send(JSON.stringify(getLayoutPayloadTicTacToe("layout", tournamentId, t)));
	}
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
	e.preventDefault();
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
	else if (target.dataset.link)
		id = "link";

	if(menu && !bypass.includes((e.target as HTMLElement).id)){
		menu.classList.add('hidden');
	}

	const dots_ = Array.from(document.querySelectorAll('[data-friend_option="0"]'));
	if (dots_.length)
		for (let d of dots_)
			d.classList.add("hidden")

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
			if (dots)
				dots.classList.toggle("hidden");
			break;
		case "friend_option":
			if (target.dataset.friend_option === "block"){
				WS.send(JSON.stringify({ type: "chat", subtype: "block", receiverId: target.dataset.friend_id }))
				changeMode("list");
			} else if(target.dataset.friend_option === "pong" || target.dataset.friend_option === "bong" || target.dataset.friend_option === "tictactoe") {
				const { friend_id, friend_name, friend_avatar } = target.dataset;
				const me = JSON.parse(sessionStorage.TRANSCENDER_USER).user;
				const you = { id: friend_id, name: friend_name, avatar: friend_avatar, human: true }
				const users = [me, you];
				const rounds = [{ name: 'Finals', matches: [{ users }] }];
				const game = target.dataset.friend_option;
				const tournament = { name: friend_id === 'anonymous@gmail.com' ? 'Guest play' : 'Single player', users, rounds, gameType: game };
				createTournament(tournament);
			} else if(target.dataset.friend_option === "profile") {
				location.hash = `#/landing/profile/${target.dataset.friend_id}`;
			}
			break;
		case "link":
			location.hash = target.dataset.link;
			break;
		case "chat":
			break;
		case "sendwrap": case "sendbtn": case "sendpath":
			sendMessage();
			break;
		case "giveup":
			WS.send(JSON.stringify({ type: location.hash.slice(1).split('/')[2], subtype: "giveup" }))
			break;
		default:
			if (chat)
				chat.classList.add("hidden");
			changeMode("count");
			break;
	}
};

addEventListener('wheel', handleWheel);
addEventListener('keydown', handleKeyDown);
addEventListener("keydown", paddleHandler);
addEventListener("keyup", paddleUpHandler);
addEventListener("mouseup", tapHandler);
addEventListener("resize", resizeScreen);
addEventListener("click", clickHandler);
addEventListener("keyup", keyHandler);
addEventListener('online', initWebSocket);

const removeEvents = () => {
	removeEventListener("keydown", paddleHandler);
	removeEventListener("mouseup", tapHandler);
	removeEventListener("resize", resizeScreen);
}

let keys = {};
export function gameLoop() {
	if (location.hash.includes('#/landing/pong') || location.hash.includes('#/landing/bong')) {
		const type = location.hash.split('/')[2];
		if (keys['KeyZ'])
			send(JSON.stringify({ type,  subtype: "play",  isDown: true, side: 0, key: 'z' }));
		if (keys['KeyM'])
			send(JSON.stringify({ type,  subtype: "play",  isDown: true, side: 1, key: 'm' }));
		if (keys['KeyA'])
			send(JSON.stringify({ type,  subtype: "play",  isDown: false, side: 0, key: 'a' }));
		if (keys['KeyK'])
			send(JSON.stringify({ type,  subtype: "play",  isDown: false, side: 1, key: 'k' }));
		setTimeout(gameLoop, 15);
	} else {
		keys = {};
	}
}

const waitForConnection = function (callback, interval) {
    if (WS.readyState === 1) {
        callback();
    } else {
        setTimeout(function () {
            waitForConnection(callback, interval);
        }, interval);
    }
};

export const send = function (message, callback = null) {
	if (!WS)
		return;
    waitForConnection(function () {
        WS.send(message);
        if (callback) {
          callback();
        }
    }, 1000);
};
