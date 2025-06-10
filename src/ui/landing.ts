let hydrateTemplate = async (url) => {
	switch(url) {
		case 'pongsel': case 'tictactoesel':
			document.querySelector("#single").addEventListener('click', (e) => {
				sessionStorage.mode = 'single';
				location.hash = '#/landing/players';
			});

			document.querySelector("#multiplayer").addEventListener('click', (e) => {
				sessionStorage.mode = 'multi';
				location.hash = '#/landing/players';
			});

			document.querySelector("#tournament").addEventListener('click', (e) => {
				sessionStorage.mode = 'tournament';
				location.hash = '#/landing/players';
			});

			sessionStorage.setItem('selectedGame', url === 'pongsel' ? 'pont' : 'tictactoe');
			break;
		case 'players':
			const mode = sessionStorage.mode;
			const div = document.querySelector("#players");
			const sub = document.querySelector("#submit");
			const response = await fetch(['single', 'multi'].includes(mode) ? '/auth/computer' : '/auth/friends');
			const friends = await response.json();
			const currentUser = JSON.parse(localStorage.TRANSCENDER_USER).user;
			const uid = currentUser.id;
			friends.push(currentUser);
			div.innerHTML = friends.map(f => {
				return `
				<div id="${f.id}" data-sid="${f.id}" data-name="${f.name}" data-avatar="${f.avatar}" class="player relative cursor-pointer w-full ${f.id === uid ? 'bg-amber-400' : 'bg-white'} flex items-center p-2 rounded-sm shadow-2xs">
					<img data-sid="${f.id}" class="w-10 h-10 rounded-sm" src="${f.avatar}" alt="">
					<span data-sid="${f.id}" class="absolute bottom-2 left-10 transform translate-y-1/4 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
					<span data-sid="${f.id}" class="ml-2 font-sans text-sm">${f.name}</span>
				</div>`
			}).join('');
			div.addEventListener('click', (e) => {
				const cel : any = e.target;
				if (cel.dataset) {
					const el = document.querySelector(`#${cel.dataset.sid}`);
					if (el && el.id !== uid) {
						el.classList.toggle('bg-amber-400');
						el.classList.toggle('bg-white');
					}
				}
			});
			sub.addEventListener('click', (e) => {
				const users = [];
				document.querySelectorAll('div [class*="bg-amber-400"').forEach(n => {
					const h : any = n;
					users.push({ id: n.id, name: h.dataset.name, avatar: h.dataset.avatar });
				});
				shuffle(users);
				const tusers = users.slice();
				const len = users.length;
				const el : HTMLInputElement = document.querySelector('#first_name');
				const tname = el.value;
				const n = Math.log2(len);
				let m = len / 2;
				if (tname && len != 1 && Number.isInteger(n)) {
					const rounds = [];
					let name;
					for (let i = 1, j = n - 3, k = 0; i <= n; i++, j--, k+=2) {
						let matches = [];
						for (let p = 0; p < m; p++){
							const us = [tusers.pop(), tusers.pop()];
							matches.push({ users: us.filter(r => !!r) });
						}
						switch (n - i) {
							case 0:
								name = 'Finals';
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

					const gameType = sessionStorage.getItem('selectedGame');

					localStorage.tournament = JSON.stringify({ name: tname, users, rounds, gameType: gameType });
					location.hash = '#/landing/stats';
				} else if (!tname) {
					document.querySelector('#error').innerHTML = 'Tournament name should not be empty';
				} else {
					document.querySelector('#error').innerHTML = 'Please select a base 2 number of participants.';
				}
			});
			break;
		case 'stats':
			const tournament = JSON.parse(localStorage.tournament);
			localStorage.tournament = '';
			const r : HTMLInputElement = document.querySelector('#rounds');
			const content = `
			<div class="mb-4 grid grid-flow-col grid-cols-${tournament.rounds.length} items-center border-0 border-b-2 border-gray-200 text-center text-lg font-bold uppercase">
				${tournament.rounds.map(r => `<div>${r.name}</div>`).join('')}
			</div>
			<div class="grid grid-flow-col grid-cols-${tournament.rounds.length} items-center">
				${tournament.rounds.map((r, i) => `
					<div class="${i > 0 ? "mx-2" : ""} grid h-1/${i > 0 ? i * 2 : 1} grid-flow-row grid-rows-${r.matches.length}">
						${ r.matches.map((m, j) => {

							const rows = `
							<div class="grid grid-flow-col grid-cols-2">
								<p class="font-semibold w-60">${m.users[0] ? m.users[0].name : ''}</p>
								<p class="text-right">0</p>
							</div>
							<div class="grid grid-flow-col grid-cols-2">
								<p class="font-semibold w-60">${m.users[1] ? m.users[1].name : ''}</p>
								<p class="text-right">0</p>
							</div>`

							let html = `<div class="mb-4 rounded-md bg-gray-200 px-4 py-2 text-gray-900 space-y-2 text-xs md:text-base">${rows}</div>`

							return html;

						}).join('')}
					</div>
				`).join('')}
			</div>
			<button id="submit" type="submit" class="text-white bg-blue-700 mt-5 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Create tournament</button>`
			r.innerHTML = content;

			const final = document.querySelector("#submit");
			final.addEventListener('click', async (e) => {
				const gameName = tournament.gameType;

				const tournamentData = {
					...tournament,
					gameName: gameName
				};

				await fetch('/api/tournament', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(tournamentData)
				});
				location.hash = '/';
			});

			break;
		default:
			break;
	}
}