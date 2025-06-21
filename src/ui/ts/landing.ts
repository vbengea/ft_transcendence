import { createTournament, changeMode, lang, loadLang } from './events';
import { getLayoutPayloadPong, displayPong } from './games/pong';
import { getLayoutPayloadBong, displayBong } from './games/bong';
import { getLayoutPayloadTicTacToe, displayTicTacToe } from './games/tictactoe';
import { play } from './games/main';
import { hydrateProfile } from './hydrates/profile';
import { hydrateSettings } from './hydrates/settings';
import { fetchOnlineStatus } from './utils';

function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

let hydrateTemplate = async (url, params) => {
	const userData = JSON.parse(sessionStorage.TRANSCENDER_USER).user;

	switch(url) {

		case 'pongsel': case 'bongsel': case 'tictactoesel':
			const multi = document.querySelector("#multiplayer");
			document.querySelector("#single").addEventListener('click', (e) => {
				sessionStorage.mode = 'single';
				location.hash = '#/landing/players';
			});
			if (multi) {
				multi.addEventListener('click', (e) => {
					sessionStorage.mode = 'multi';
					location.hash = '#/landing/players';
				});
			}
			document.querySelector("#tournament").addEventListener('click', (e) => {
				sessionStorage.mode = 'tournament';
				location.hash = '#/landing/players';
			});
			if (url === 'bongsel') {
				sessionStorage.setItem('selectedGame', 'bong');
			} else {
				sessionStorage.setItem('selectedGame', url === 'pongsel' ? 'pong' : 'tictactoe');
			}
			break;

		case 'players':
			const mode = sessionStorage.mode;
			const div = document.querySelector("#players");
			const sub = document.querySelector("#submit");
			const inp = document.querySelector("input");
			const lab = document.querySelector("label");
			const isComputer = ['single', 'multi'].includes(mode);
			let num = 0;
			if (mode === 'single')
				num = 2;
			else 
				num = 4;
			if (isComputer){
				inp.value = mode === 'single' ? 'Single player' : 'Multi player';
				inp.style.display = 'none';
				lab.innerHTML = lang(mode === 'single' ? 'Pick 2' : 'Pick 4');
			}
			const response = await fetch(mode === 'single' ? `/auth/computer` : (mode === 'multi' ? `/auth/friends/${userData.id}` : `/auth/human_friends`));
			const friends = await response.json();
			const currentUser = userData;
			const uid = currentUser.id;
			friends.push(currentUser);

			const onlineStatuses = await fetchOnlineStatus(friends);

			div.innerHTML = lang(friends.map(f => {
				const isOnline = onlineStatuses[f.id] === true;
				const statusClass = isOnline ? 'bg-green-400' : 'bg-gray-400';
				return `
				<div id="${f.id}" data-sid="${f.id}" data-name="${f.name}" data-avatar="${f.avatar}" data-human="${f.human}" class="player relative cursor-pointer w-full ${f.id === uid ? 'bg-amber-400' : 'bg-white'} flex items-center p-2 rounded-sm shadow-2xs">
					<img data-sid="${f.id}" class="w-10 h-10 rounded-sm" src="${f.avatar}" alt="">
					<span data-sid="${f.id}" class="absolute bottom-2 left-10 transform translate-y-1/4 w-3.5 h-3.5 ${statusClass} border-2 border-white dark:border-gray-800 rounded-full"></span>
					<span data-sid="${f.id}" class="ml-2 font-sans text-sm">${f.name}</span>
				</div>`
			}).join(''));
			
			div.addEventListener('click', (e) => {
				const cel : any = e.target;
				if (cel.dataset) {
					const el = document.querySelector(`#${cel.dataset.sid}`);
					if (el && el.id !== uid) {
						if (isComputer) {
							const len = document.querySelectorAll('div [class*="bg-amber-400"').length;
							if (len === num && el.classList.contains('bg-white')) {}
							else {
								el.classList.toggle('bg-amber-400');
								el.classList.toggle('bg-white');
							}
						} else {
							el.classList.toggle('bg-amber-400');
							el.classList.toggle('bg-white');
						}
					}
				}
			});

			sub.addEventListener('click', async (e) => {
				const users = [];
				document.querySelectorAll('div [class*="bg-amber-400"').forEach(n => {
					const h : any = n;
					users.push({ 
						id: n.id, 
						name: h.dataset.name, 
						avatar: h.dataset.avatar, 
						human: h.dataset.human == 'true' ? true : false 
					});
				});
				shuffle(users);
				const tusers = users.slice();

				if (mode === 'multi' && users.length !== 4){
					document.querySelector('#error').innerHTML = lang('Please select 4 players.');
					return;
				}

				const len = users.length;
				const el : HTMLInputElement = document.querySelector('#tournament_name');
				const tname = el.value;
				const n = Math.log2(len);

				let m = len / 2;
				if (tname && len != 1 && Number.isInteger(n)) {
					const rounds = [];
					let name;

					if (isComputer && mode === 'multi') {
						rounds.push({ name: '2v2', matches: [{ users }] });
					} else {
						for (let i = 1, j = n - 3, k = 0; i <= n; i++, j--, k+=2) {
							let matches = [];
							for (let p = 0; p < m; p++){
								const us = [tusers.pop(), tusers.pop()];
								matches.push({ users: us.filter(r => !!r) });
							}
							switch (n - i) {
								case 0:
									name = isComputer ? '1v1' : 'Finals';
									break;
								case 1:
									name = 'Semifinals';
									break;
								case 2:
									name = 'Quarterfinals'
									break;
								default:
									name = `Round ${j}`;
							}
							m /= 2;
							rounds.push({ name, matches });
						}
					}

					const gameType = sessionStorage.getItem('selectedGame');
					const tournament = { name: tname, users, rounds, gameType: gameType };

					localStorage.tournament = JSON.stringify(tournament);

					createTournament(tournament);

				} else if (!tname) {
					document.querySelector('#error').innerHTML = lang('Tournament name should not be empty');
				} else {
					document.querySelector('#error').innerHTML = lang('Please select a base 2 number of players.');
				}
			});
			break;

		case 'stats':
			const tournament1 = JSON.parse(localStorage.tournament);
			const r1 : HTMLInputElement = document.querySelector('#rounds');
			if (tournament1) {
				const content1 = `
				<div class="mb-4 grid grid-flow-col grid-cols-${tournament1.rounds.length} items-center border-0 border-b-2 border-gray-200 text-center text-lg font-bold uppercase">
					${tournament1.rounds.map(r1 => `<div>${r1.name}</div>`).join('')}
				</div>
				<div class="grid grid-flow-col grid-cols-${tournament1.rounds.length} items-center">
					${tournament1.rounds.map((r, i) => `
						<div class="${i > 0 ? "mx-2" : ""} grid h-1/${i > 0 ? i * 2 : 1} grid-flow-row grid-rows-${r.matches.length}">
							${ r.matches.map((m, j) => {

								const rows = `
								<div class="grid grid-flow-col grid-cols-2">
									<p class="font-semibold w-60">${m.user1 ? m.user1.name : ''}</p>
									<p class="text-right">${m.user1Score || 0}</p>
								</div>
								<div class="grid grid-flow-col grid-cols-2">
									<p class="font-semibold w-60">${m.user2 ? m.user2.name : ''}</p>
									<p class="text-right">${m.user2Score || 0}</p>
								</div>`

								let html = `<div class="mb-4 rounded-md bg-gray-200 px-4 py-2 text-gray-900 space-y-2 text-xs md:text-base">${rows}</div>`

								return html;

							}).join('')}
						</div>
					`).join('')}
				</div>`
				r1.innerHTML = lang(content1);
			}
			break;

		case 'win': case 'loose':
			if (url === 'win'){
				const match = await (await fetch('/api/tournaments/current_match')).json();
				
				setTimeout(async () => {
					if (match) {					
						const t = await (await fetch(`/api/tournament/${params[0]}`)).json();
						localStorage.tournament = JSON.stringify(t);
						location.hash = '#/landing/stats';
						setTimeout(() => location.hash = `#/landing/${match.round.tournament.game.name}/${match.round.tournament.id}`, 3000);

					} else {
						const tid = params[0];
						const t = tid ? await (await fetch(`/api/tournament/${tid}`)).json() : null;
						if (t && t.totalRounds > 1) {
							localStorage.tournament = JSON.stringify(t);
							location.hash = '#/landing/stats';
							setTimeout(() => {
								location.hash = '#/landing/matches';
								localStorage.tournament = '';
							}, 3000);
						} else {
							location.hash = '#/landing/matches';
						}
					}
				}, 3000);

			} else {
				setTimeout(() => location.hash = '#/landing/matches', 3000);
			}
			break;

		case 'nogame':
			setTimeout(() => location.hash = '#/', 3000);
			break;

		case 'matches':
			const it = document.querySelector("#submit");
			const user = userData;
			const matchesRaw = await fetch(`/api/matches/${user.id}`);
			const matches = await matchesRaw.json();
			const mt1 : HTMLInputElement = document.querySelector('#matches1');
			const mt2 : HTMLInputElement = document.querySelector('#matches2');
			const mt3 : HTMLInputElement = document.querySelector('#matches3');

			it.addEventListener('click', () => {
				location.hash = '/';
			});

			let count = matches.length, wins = 0, loses = 0, avg = 0;
			let ii = 0, jj = 0;
			const umap = new Map();
			let u = null;

			for(let m of matches) {

				if (m.user1Id == user.id) {
					ii = 1;
					jj = 2;
				} else if (m.user2Id === user.id) {
					ii = 2;
					jj = 1;
				} else if (m.user3Id === user.id) {
					ii = 3;
					jj = 2;
				} else if (m.user4Id === user.id) {
					ii = 4;
					jj = 1;
				}

				u = umap.get(m[`user${jj}`].name) || { name: m[`user${jj}`].name, count: 0, wins: 0, loses: 0, avg: '' };
				u.count++;

				let html = `<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
						<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
							${m[`user${jj}`].name}
						</th>`;

				if (m[`user${ii}Score`] > m[`user${jj}Score`]) {
					u.wins++;
					umap.set(m[`user${jj}`].name, u);
					wins++;
					html += `<td class="px-6 py-4 text-center">1</td><td class="px-6 py-4 text-center"></td>`

				} else {
					u.loses++;
					loses++;
					html += `<td class="px-6 py-4 text-center"></td><td class="px-6 py-4 text-center">1</td>`
				}

				html += `<td class="px-6 py-4 text-center">${m.round.tournament.name}</td>`

				html +=  `<td class="px-6 py-4 text-center">${ (new Date(m.startTime)).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }</td></tr>`;

				if (m.round.tournament.game.name === 'pong' || m.round.tournament.game.name === 'bong')
					mt2.innerHTML += html;
				else
					mt3.innerHTML += html;

				let mavg = u.wins * 100 / u.count;
				u.avg = mavg.toFixed(1);
			}

			avg = count ? (wins * 100 / count) : 0;
			let avgs = avg.toFixed(1);

			document.querySelector('#countto1').innerHTML = lang(count + '');
			document.querySelector('#countto2').innerHTML = lang(wins + '');
			document.querySelector('#countto3').innerHTML = lang(loses + '');
			document.querySelector('#countto4').innerHTML = lang(avgs + '');

			umap.forEach(m => {
				mt1.innerHTML += `<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
					<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
						${m.name}
					</th>
					<td class="px-6 py-4 text-center">
						${m.wins}
					</td>
					<td class="px-6 py-4 text-center">
						${m.loses}
					</td>
					<td class="px-6 py-4 text-center">
						${m.avg}%
					</td>
				</tr>`;
			});

			break;

		case 'settings':
			await hydrateSettings();
			break;

		case 'profile':
			await hydrateProfile(params[0] || userData.id);
			break;

		default:
			break;
	}
}

const playPong = async (params) => {
	let mode = 'single';
	const app = document.querySelector('#app');
	const tournamentId = params[0];

	if (!tournamentId){
		app.innerHTML = lang(await (await fetch(`./pages/nogame.html`)).text());
		return;
	}

	app.innerHTML = lang(await (await fetch(`./pages/pong.html`)).text());

	const LHS = document.querySelector("#paddle-left-wrapper");
	const RHS = document.querySelector("#paddle-right-wrapper");

	const match : any = await (await fetch('/api/tournaments/current_match')).json();

	if (match && match.round && match.round.tournament && match.round.tournament.totalRounds == 1 && match.round.tournament.totalPlayers === 4)
		mode = 'multi';

	if (mode === 'single') {
		LHS.innerHTML = lang(`<div id="score-left" class="absolute flex flex-col self-start left-4/12 top-5"></div>
			<div id="paddle-left-1" class="mx-1 my-3 w-3 h-1/8 bg-white absolute self-center"></div>`);

		RHS.innerHTML = lang(`<div id="score-right" class="absolute flex flex-col self-start right-4/12 top-5"></div>
			<div id="paddle-right-2" class="mx-1 my-3 w-3 h-1/8 bg-white absolute self-center right-0"></div>`);
	} else {
		LHS.innerHTML = lang(`<div id="score-left" class="absolute flex flex-col self-start left-4/12 top-5">
				<span class="text-red-300"></span><span class="text-green-300"></span>
				<span class="text-blue-300"></span><span class="text-yellow-300"></span>
			</div>
			<div id="paddle-left-1" class="mx-1 my-0 w-1/96 h-1/8 bg-red-300 absolute self-center"></div>
			<div id="paddle-left-3" class="mx-1 my-0 w-1/96 h-1/8 bg-green-300 absolute self-center"></div>`);

		RHS.innerHTML = lang(`<div id="score-right" class="absolute flex flex-col self-start right-4/12 top-5"></div>
			<div id="paddle-right-2" class="mx-1 my-0 w-3 h-1/8 bg-blue-300 absolute self-center right-0"></div>
			<div id="paddle-right-4" class="mx-1 my-0 w-3 h-1/8 bg-yellow-300 absolute self-center right-0"></div>`);
	}

	play(getLayoutPayloadPong, displayPong, 'pong', tournamentId);
};

const playBong = async (params) => {
	const tournamentId = params[0];
	const app = document.querySelector('#app');
	if (!tournamentId){
		app.innerHTML = lang(await (await fetch(`./pages/nogame.html`)).text());
		return;
	}
	app.innerHTML = lang(await (await fetch(`./pages/bong.html`)).text());
	play(getLayoutPayloadBong, displayBong, 'bong', tournamentId);
};

const playTicTacToe = async (params) => {
	const tournamentId = params[0];
	const app = document.querySelector('#app');
	if (!tournamentId){
		app.innerHTML = lang(await (await fetch(`./pages/nogame.html`)).text());
		return;
	}
	app.innerHTML = lang(await (await fetch(`./pages/tictactoe.html`)).text());
	play(getLayoutPayloadTicTacToe, displayTicTacToe, 'tictactoe', tournamentId);
};

export const landing = async (url) => {
	const userData = JSON.parse(sessionStorage.TRANSCENDER_USER).user;
	const app = document.querySelector('#app');
	const params = [];

	try {
		loadLang(sessionStorage.lang);
		
		if (url.includes('/')){
			const paths = url.split('/');
			let i = 0;
			for (let p of paths){
				if (i === 0)
					url = p;
				else
					params.push(p);
				i++;
			}
		}

		if (url === 'pong' && params.length === 1) {
			playPong(params);

		} else if (url === 'tictactoe' && params.length === 1) {
			playTicTacToe(params);

		} else if (url === 'bong') {
			playBong(params);

		} else {
			if (url === 'pong' || url === 'bong' || url === 'tictactoe')
				url = 'nogame';

			app.innerHTML = lang(await (await fetch(`./pages/template.html`)).text());

			const user = document.querySelector("#user");
			const img : any = document.querySelector('#user_inner_3');
			const menu = document.querySelector("#menu");

			changeMode("count");
			
			img.src = userData.avatar;

			user.addEventListener('click', (e) => {
				e.preventDefault();
				menu.classList.remove('hidden');
			});

			user.addEventListener('click', (e) => {
				e.preventDefault();
				menu.classList.remove('hidden');
			});

			const content = document.querySelector('#content');
			const response = await fetch(`./pages/${url}.html`);

			if (response.ok) {
				content.innerHTML = lang(await response.text());
				hydrateTemplate(url, params);
			} else {
				content.innerHTML = lang('<div class="mt-12 text-center text-2xl text-red-400">Content not found</div>');
			}
		}

	} catch (e) {
		console.log(e)
	}
};
