interface Window {
	google?: {
		accounts: {
			id: {
				initialize: (config: { client_id: string, callback: (response: { credential: string }) => void }) => void;
				prompt: () => void;
			}
		}
	}
}
const appDiv = "app";

let routes = {};
let templates = {};

const BASE = '/auth';

let template = (name, templateFunction) => {
	return templates[name] = templateFunction;
};

let route = (path, template) => {
	if (typeof template == "function") {
		return routes[path] = template;
	}
	else if (typeof template == "string") {
		return routes[path] = templates[template];
	}
	else {
		return;
	}
};

template('template-2fa-setup', async () => {
	const statusResponse = await fetch(`${BASE}/status`, {
		credentials: "include"
	});

	if (statusResponse.ok) {
		const userData = await statusResponse.json();
		if (userData.user && userData.user.two_fa_enabled) {
			location.hash = '#/profile';
			return document.createElement('div');
		}
	}

	let myDiv = document.getElementById(appDiv);
	myDiv.innerHTML = "";
	const setupDiv = createDiv('setup-2fa', Templates.twofa_setup);

	myDiv.appendChild(setupDiv);

	const response = await fetch(`${BASE}/2fa/setup`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		}
	});

	if (response.ok) {
		const data = await response.json();
		document.querySelector('#qrcode-container').innerHTML = `<img src="${data.qrcode}" alt="QR Code">`;
		document.querySelector('#manual-code').textContent = data.manualCode;
	} else {
		const err = document.querySelector("#error");
		if (err) {
			err.innerHTML = "Failed to load 2FA setup. Please try again.";
		}
	}

	setupDiv.addEventListener('submit', async (e) => {
		e.preventDefault();
		var data = new FormData(document.querySelector('form'));
		const response = await fetch(`${BASE}/2fa/verify`, {
			method: "POST",
			body: JSON.stringify({ token: data.get('code') }),
			headers: {
				"Content-Type": "application/json"
			}
		});

		const json = await response.json();
		if(response.ok) {
			location.hash = '/';
		} else {
			const err = document.querySelector("#error");
			err.innerHTML = json.message || json.error;
		}
	});

	return setupDiv;
});


template('template-2fa-verify', async ()  => {
	let myDiv = document.getElementById(appDiv);
	myDiv.innerHTML = "";
	const verifyDiv = createDiv('verify-2fa', Templates.twofa_verify);

	verifyDiv.addEventListener('submit', async (e) => {
		e.preventDefault();
		var data = new FormData(document.querySelector('form'));
		const tempToken = localStorage.getItem('tempToken');

		const response = await fetch(`${BASE}/login/2fa`, {
			method: "POST",
			body: JSON.stringify({ token: tempToken, code: data.get('code') }),
			headers: {
				"Content-Type": "application/json"
			}
		});

		const json = await response.json();
		if (response.ok) {
			localStorage.removeItem('tempToken');
			location.hash = '/';
		} else {
			const err = document.querySelector("#error");
			err.innerHTML = json.message || json.error;
		}
	});

	return myDiv.appendChild(verifyDiv);
});


template('template-view3', async () => {
	let myDiv = document.getElementById(appDiv);
	myDiv.innerHTML = "";
	const link3 = createDiv('view3', Templates.login) as HTMLElement;
	
	link3.querySelector('#google-signin').addEventListener('click', async () => {
		const configResponse = await fetch(`${BASE}/config`);
		const config = await configResponse.json();

		if (!window.google) {
			const script = document.createElement('script');
			script.src = 'https://accounts.google.com/gsi/client';
			script.async = true;
			document.head.appendChild(script);
			
			script.onload = initGoogleSignIn;
		} else {
			initGoogleSignIn(config.googleClientId);
		}
		
		function initGoogleSignIn(clientId) {
			window.google.accounts.id.initialize({
				client_id: clientId,
				callback: handleGoogleSignIn
			});
			window.google.accounts.id.prompt();
		}
		
		async function handleGoogleSignIn(response) {
			try {
				const id_token = response.credential;
				
				const resp = await fetch(`${BASE}/google`, {
					method: "POST",
					body: JSON.stringify({ id_token }),
					headers: {
						"Content-Type": "application/json"
					}
				});
				
				const json = await resp.json();
				if(resp.ok) {
					if (json.message == '2FA required') {
						localStorage.setItem('tempToken', json.tempToken);
						location.hash = '/2fa/verify';
					} else {
						location.hash = '/';
					}
				} else {
					const err = document.querySelector("#error");
					err.innerHTML = json.message || json.error;
				}
			} catch (error) {
				console.error('Error handling Google Sign In:', error);
				const err = document.querySelector("#error");
				err.innerHTML = "An error occurred with Google Sign In. Please try again.";
			}
		}
	});
	
	link3.addEventListener('submit', async (e) => {
		e.preventDefault();
		var data = new FormData(document.querySelector('form'));
		const response = await fetch(`${BASE}/login`, {
			method: "POST",
			body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
			headers: {
				"Content-Type": "application/json"
			}
		});
		
		const json = await response.json();
		if(response.ok) {
			if (json.message === '2FA required') {
				localStorage.setItem('tempToken', json.tempToken);
				location.hash = '/2fa/verify';
			} else {
				location.hash = '#/landing/welcome';
			}
		} else {
			const err = document.querySelector("#error");
			err.innerHTML = json.message || json.error;
		}
	});
	
	return myDiv.appendChild(link3);
});

template('template-view4', async () => {
	let myDiv = document.getElementById(appDiv);
	myDiv.innerHTML = "";
	const link4 = createDiv('view4', Templates.register) as HTMLElement;

	const passwordField = link4.querySelector('#password') as HTMLInputElement;
	const confirmPasswordField = link4.querySelector('#confirm-password') as HTMLInputElement;
	const errorElement = link4.querySelector('#error');

	confirmPasswordField.addEventListener('input', () => {
		if (passwordField.value !== confirmPasswordField.value) {
			errorElement.innerHTML = "Passwords do not match";
		} else {
			errorElement.innerHTML = "";
		}
	});

link4.addEventListener('submit', async (e) => {
	e.preventDefault();
	var data = new FormData(document.querySelector('form'));

	if (data.get('password') !== data.get('confirm-password')) {
		const err = document.querySelector("#error");
		err.innerHTML = "Passwords do not match";
		return;
	}
	const response = await fetch(`${BASE}/register`, {
		method: "POST",
		body: JSON.stringify({ name: data.get('name'), email: data.get('email'), password: data.get('password') }),
		headers: {
			"Content-Type": "application/json"
		}
	});
	const json = await response.json();
	if(response.ok)
	{
		location.hash = '/';
	}
	else
	{
		const err = document.querySelector("#error");
		err.innerHTML = json.message || json.error;
	}
});
return myDiv.appendChild(link4);
});

template('template-profile', async () => {
	let myDiv = document.getElementById(appDiv);
	myDiv.innerHTML = "";
	const profileDiv = createDiv('profile', Templates.profile);
	myDiv.appendChild(profileDiv);

	try {
		const response = await fetch(`${BASE}/status`, {
			credentials: "include"
		});

		if (response.ok) {
			const userData = await response.json();
			const statusContainer = document.getElementById('2fa-status-container');

			if (userData.user && userData.user.two_fa_enabled) {
				statusContainer.innerHTML = `
					<div class="flex items-center mb-3">
						<svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
						<span class="text-gray-800">Two-Factor Authentication is enabled</span>
					</div>
					<p class="text-sm text-gray-600 mb-3">Your account is protected with 2FA.</p>
					<button id="disable-2fa" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
						Disable Two-Factor Authentication
					</button>
				`;

				setTimeout(() => {
					document.getElementById('disable-2fa').addEventListener('click', async () => {
						if (confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
							try {
								const response = await fetch(`${BASE}/2fa`, {
									method: 'DELETE',
									credentials: 'include',
								});

								const result = await response.json();
								if (response.ok) {
									alert('2FA has beed disabled successfully');
									location.reload();
								} else {
									alert(`Error: ${result.error || 'Failed to disable 2FA'}`);
								}
							} catch (err) {
								alert('An error ocurred. Please try again.');
								console.log(err);
							}
						}
					});
				}, 100);
			} else {
				statusContainer.innerHTML = `
					<a href="#/2fa/setup" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
						Setup Two-Factor Authentication
					</a>
					<p class="text-sm text-gray-600 mt-2">Add an extra layer of security to your account.</p>
				`;
			}

			statusContainer.innerHTML += `
				<div class="mt-8 pt-6 border-t border-gray-200">
					<h3 class="text-lg font-semibold text-gray-800 mb-3">Danger Zone</h3>
					<p class="text-sm text-gray-600 mb-3">Once you delete your account, there is no going back. Please be certain.</p>
					<button id="delete-account" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
						Delete Account
					</button>
				</div>
			`;

			setTimeout(() => {
				document.getElementById('delete-account').addEventListener('click', async () => {
					if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
						const confirmText = prompt('Type "DELETE" to confirm account deletion:');
						if (confirmText === 'DELETE') {
							try {
								const response = await fetch(`${BASE}/account`, {
									method: 'DELETE',
									credentials: 'include',
								});

								if (response.ok) {
									alert('Your accout has beed deleted successfully');
									location.hash = '#/login';
								} else {
									const result = await response.json();
									alert(`Error: ${result.error || 'Failed to delete account'}`);
								}
							} catch (err) {
								alert('An error ocurred. Please try again.');
								console.error(err);
							}
						} else if (confirmText !== null) {
							alert('Account deletion cancelled. You must type "DELETE" exactly to confirm.')
						}
					}
				});
			}, 100);

		} else {
			const statusContainer = document.getElementById('2fa-status-container');
			statusContainer.innerHTML = `
				<div class="text-red-500">
					<p>Authentication error. Please <a href="#/login" class="text-indigo-600 hover:underline">log in</a> to view your profile.</p>
				</div>
			`;
		}
	} catch (err) {
		console.error("Error fetching user data:", err);
		const statusContainer = document.getElementById('2fa-status-container');
		statusContainer.innerHTML = `
			<div class="text-red-500">
				<p>Error connecting to server. Please try again later.</p>
			</div>
		`;
	}
	return profileDiv;
});

route('/', 'template1');
route('/login', 'template-view3');
route('/register', 'template-view4');

route('/2fa/setup', 'template-2fa-setup');
route('/2fa/verify', 'template-2fa-verify');

route('/profile', 'template-profile');

let createDiv = (id, xmlString) => {
	let d = document.createElement('div');
	d.id = id;
	d.innerHTML = xmlString;
	return d.firstChild;
};

async function authorized() {
	const response = await fetch(`${BASE}/status`, { credentials: "include" });
	if (response.status == 401) {
		location.hash = '#/login';
		return false;
	} else {
		const json = await response.json();
		localStorage.setItem('TRANSCENDER_USER', JSON.stringify(json));
	}
	return true;
}

async function resolveRoute(route) {
	try {
		if (route == '/logout') {
			fetch(`${BASE}/logout`, { method: "DELETE" });
			localStorage.TRANSCENDER_USER = '';
			location.hash = '#/login';
			return () => {};
		} else if (route == '/login' || route == '/register' || route == '/2fa/verify') {
			return routes[route];
		} else if (route == '/2fa/setup') {
			const response = await fetch(`${BASE}/status`, {
				credentials: "include"
			});
			if (await authorized()) {
				const userData = await response.json();
				if (userData.user && userData.user.two_fa_enabled) {
					location.hash = '#/profile';
					return () => {};
				} else {
					return routes[route];
				}
			}
		} else {
			if (await authorized()) {
				if (route == '/') {
					location.href = '#/landing/welcome';
					return () => {};
				} else {
					return routes[route];
				}
			}
		}
	} catch (error) {
		throw new Error("The route is not defined");
	}
}

function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

let hydrateTemplate = async (url) => {
	switch(url) {
		case 'pongsel': case 'tictactoesel':
			const sing = document.querySelector("#single");
			const mult = document.querySelector("#multiplayer");
			const tour = document.querySelector("#tournament");
			const click = (e) => {
				location.hash = '#/landing/players';
			}
			const selector = async (e) => {
				const app = document.querySelector('#app');
				if (url === 'pongsel') {
					app.innerHTML = await (await fetch(`./pages/pong.html`)).text();
					play(getLayoutPayloadPong, displayPong, 'pong');
				}
				else if (url === 'tictactoesel') {
					app.innerHTML = await (await fetch(`./pages/tictactoe.html`)).text();
					play(getLayoutPayloadTicTacToe, displayTicTacToe, 'tictactoe');
				}
			}
			if (sing) {
				sing.addEventListener('click', selector);
			}
			if (mult){
				mult.addEventListener('click', click);
			}
			if (tour) {
				tour.addEventListener('click', click);
				sessionStorage.setItem('selectedGame', url === 'pongsel' ? 'pont' : 'tictactoe');
			}
			break;
		case 'players':
			const div = document.querySelector("#players");
			const sub = document.querySelector("#submit");
			const response = await fetch('/auth/friends');
			const friends = await response.json();
			friends.push(JSON.parse(localStorage.TRANSCENDER_USER).user);
			div.innerHTML = friends.map(f => {
				return `
				<div id="${f.id}" data-sid="${f.id}" data-name="${f.name}" data-avatar="${f.avatar}" class="player relative cursor-pointer w-full bg-white flex items-center p-2 rounded-sm shadow-2xs">
					<img data-sid="${f.id}" class="w-10 h-10 rounded-sm" src="${f.avatar}" alt="">
					<span data-sid="${f.id}" class="absolute bottom-2 left-10 transform translate-y-1/4 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
					<span data-sid="${f.id}" class="ml-2 font-sans text-sm">${f.name}</span>
				</div>`
			}).join('');
			div.addEventListener('click', (e) => {
				const cel : any = e.target;
				if (cel.dataset) {
					const el = document.querySelector(`#${cel.dataset.sid}`);
					if (el) {
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

let landing = async (url) => {
	const app = document.querySelector('#app');
	try {
		app.innerHTML = await (await fetch(`./pages/template.html`)).text();
		const menu = document.querySelector("#menu");
		const user = document.querySelector("#user");
		const img : any = document.querySelector('#user_inner_3');
		const bypass = ["user", "user_inner_1", "user_inner_2", "user_inner_3"];
		img.src = JSON.parse(localStorage.TRANSCENDER_USER).user.avatar;

		user.addEventListener('click', (e) => {
			e.preventDefault();
			menu.classList.remove('hidden');
		});
		document.addEventListener('click', (e) => {
			if(!bypass.includes((e.target as HTMLElement).id))
				menu.classList.add('hidden');
		});

		const content = document.querySelector('#content');
		const response = await fetch(`./pages/${url}.html`);
		if (response.ok) {
			content.innerHTML = await response.text();
			hydrateTemplate(url);
		} else {
			content.innerHTML = '<div class="mt-12 text-center text-2xl text-red-400">Content not found</div>';
		}
	} catch (e) {
		console.log(e)
	}
};

let router = async (evt) => {
	let url = window.location.hash.slice(1) || "/";
	if (url.startsWith('/landing/')) {
		if (await authorized())
			landing(url.slice(9));
	} else {
		const routeResolved = await resolveRoute(url);
		if (routeResolved)
			routeResolved();
	}
};

window.addEventListener('load', router);
window.addEventListener('hashchange', router);