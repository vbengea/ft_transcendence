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

const twofa_setup = `<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Set Up Two-Factor Authentication</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<div class="text-center mb-6">
			<p class="mb-4">Scan this QR code with your authenticator app:</p>
			<div id="qrcode-container" class="flex justify-center"></div>
			<p class="mt-4 text-sm text-gray-500">Or enter this code manually:</p>
			<p id="manual-code" class="font-mono text-lg mt-2"></p>
		</div>

		<form class="space-y-6" action="#" method="POST">
			<div>
				<label for="code" class="block text-sm/6 font-medium text-gray-900">Verification Code</label>
				<div class="mt-2">
					<input type="text" name="code" id="code" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
				</div>
			</div>

			<div>
				<button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Verify and Enable 2FA</button>
			</div>
		</form>

		<p id="error" class="mt-10 text-center text-sm/6 text-red-600"></p>
	</div>
</div>`;

// 2FA verification page
const twofa_verify = `<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Two-Factor Authentication</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="space-y-6" action="#" method="POST">
			<div>
				<label for="code" class="block text-sm/6 font-medium text-gray-900">Enter the code from your authenticator app</label>
				<div class="mt-2">
					<input type="text" name="code" id="code" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
				</div>
			</div>

			<div>
				<button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Verify</button>
			</div>
		</form>

		<p id="error" class="mt-10 text-center text-sm/6 text-red-600"></p>
	</div>
</div>`;

const links = `	<div class="absolute right-2 top-2 z-1000 inline-flex rounded-md shadow-xs">
	<a href="#/profile" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
			Profile
	</a>
	<a href="#/pong" aria-current="page" class="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
		Pong
	</a>
	<a href="#/tictactoe" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
		Tic tac toe
	</a>
	<a href="#/logout" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
		Logout
	</a>
	</div>`;

const spash = `<div id="splash" class="bg-black absolute flex-col place-items-center h-screen w-screen top-0 invisible">
	<div id="log" class="text-gray-50 text-center mt-5"></div>
</div>`;

const pong = `<div id="pong" class="absolute flex  w-screen h-screen bg-black">
	${links}
	<div id="top-white-bar" class="absolute w-full bg-white h-2 top-1 ml-2 mr-2"></div>
	<div class="flex flex-1">
		<div id="score-left" class="absolute w-1/2 text-white text-right text-9xl pr-12"></div>
		<div id="paddle-left" class="mx-3 my-3 w-3 h-24 bg-white absolute self-center"></div>
	</div>
	<div class="border-2 border-white dashed-x-3 border-dashed mt-3 mb-3"></div>
	<div id="ball" class="absolute w-3 h-3 bg-white rounded-full"></div>
	<div class="flex flex-1">
		<div id="score-right" class="absolute w-1/2 text-white text-left text-9xl pl-12"></div>
		<div id="paddle-right" class="mx-1 my-3 w-3 h-24 bg-white absolute self-center right-0"></div>
	</div>
	<div id="bot-white-bar" class="absolute w-full bg-white h-2 bottom-1 ml-2 mr-2"></div>
	${spash}
</div>`;

const tictactoe = `<div id="tictactoe" class="absolute flex items-center justify-center w-screen h-screen">
	${links}
	<div id="score-left" class="absolute self-start left-0 w-1/2 text-black text-right text-9xl pr-12">0</div>
	<table class="w-1/2 h-1/2">
		<tr class="h-1/3 border-b-2">
			<td id="cell_1" class="border-r-2 w-1/3 text-center text-9xl"></td>
			<td id="cell_2" class="border-r-2 w-1/3 text-center text-9xl"></td>
			<td id="cell_3" class="w-1/3 text-center text-9xl"></td>
		</tr>
		<tr class="h-1/3 border-b-2">
			<td id="cell_4" class="border-r-2 w-1/3 text-center text-9xl"></td>
			<td id="cell_5" class="border-r-2 w-1/3 text-center text-9xl"></td>
			<td id="cell_6" class="w-1/3 text-center text-9xl"></td>
		</tr>
		<tr class="h-1/3">
			<td id="cell_7" class="border-r-2 w-1/3 text-center text-9xl"></td>
			<td id="cell_8" class="border-r-2 w-1/3 text-center text-9xl"></td>
			<td id="cell_9" class="w-1/3 text-center text-9xl"></td>
		</tr>
	</table>
	<div id="score-right" class="absolute w-1/2 self-start right-0 text-black text-left text-9xl pl-12">0</div>
	${spash}
</div>`;

const login = `<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<img class="mx-auto h-10 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company">
		<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign in to your account</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="space-y-6" action="#" method="POST">
			<div>
				<label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
				<div class="mt-2">
					<input type="email" name="email" id="email" autocomplete="email" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
				</div>
			</div>

			<div>
				<div class="flex items-center justify-between">
					<label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
				</div>
				<div class="mt-2">
					<input type="password" name="password" id="password" autocomplete="current-password" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
				</div>
			</div>

			<div>
				<button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign in</button>
			</div>
		</form>

		<div class="mt-6">
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm font-medium leading-6">
					<span class="bg-white px-6 text-gray-900">Or continue with</span>
				</div>
			</div>

			<div class="mt-6 flex justify-center">
				<button id="google-signin" class="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2">
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.514 0-10 4.486-10 10s4.486 10 10 10c8.326 0 10-7.721 10-11.651 0-0.561-0.057-1.102-0.161-1.631h-9.839z"/>
					</svg>
					<span>Google</span>
				</button>
			</div>
		</div>

		<p class="mt-10 text-center text-sm/6 text-gray-500">
			Want to be a member?
			<a href="#/register" class="font-semibold text-indigo-600 hover:text-indigo-500">Register</a>
		</p>

		<p id="error" class="mt-10 text-center text-sm/6 text-red-600"></p>
	</div>
</div>`;

const register = `<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<img class="mx-auto h-10 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company">
		<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Registration</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="space-y-6" action="#" method="POST">
			<div>
				<label for="name" class="block text-sm/6 font-medium text-gray-900">Your name</label>
				<div class="mt-2">
					<input type="text" name="name" id="name" autocomplete="name" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
				</div>
			</div>

			<div>
				<label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
				<div class="mt-2">
					<input type="email" name="email" id="email" autocomplete="email" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
				</div>
			</div>

			<div>
				<div class="flex items-center justify-between">
					<label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
				</div>
				<div class="mt-2">
					<input type="password" name="password" id="password" autocomplete="current-password" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
				</div>
			</div>

			<div>
				<button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Register</button>
			</div>
		</form>

	<p id="error" class="mt-10 text-center text-sm/6 text-red-600"></p>
	</div>
</div>`;

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
	const setupDiv = createDiv('setup-2fa', twofa_setup);

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
	const verifyDiv = createDiv('verify-2fa', twofa_verify);

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


const profile = `<div class="p-8 max-w-2xl mx-auto">
		<h1 class="text-2xl font-bold mb-6">User Profile</h1>
		<div class="bg-white p-6 rounded-lg shadow-md">
				<div class="mb-4">
						<h2 class="text-lg font-semibold">Account Security</h2>
						<div id="2fa-status-container" class="mt-4">
								<div class="flex items-center mb-3">
										<div class="mr-3 animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
										<span class="text-gray-600">Loading 2FA status...</span>
								</div>
						</div>
				</div>
		</div>
</div>`;



template('template1', () => {
		const myDiv = document.getElementById(appDiv);
		myDiv.innerHTML = `${links}
		<div class="flex justify-center ...">
			<img class="w-100 h-100" src="pong.png">
		</div>
	`;
		return myDiv;
});

template('template-view1', async () => {
		let myDiv = document.getElementById(appDiv);
		myDiv.innerHTML = "";
		const link1 = createDiv('view1', pong);
		return myDiv.appendChild(link1);
});

template('template-view2', async () => {
		let myDiv = document.getElementById(appDiv);
		myDiv.innerHTML = "";
		const link2 = createDiv('view2', tictactoe);
		return myDiv.appendChild(link2);
});

template('template-view3', async () => {
	let myDiv = document.getElementById(appDiv);
	myDiv.innerHTML = "";
	const link3 = createDiv('view3', login) as HTMLElement;
	
	link3.querySelector('#google-signin').addEventListener('click', async () => {
		if (!window.google) {
			const script = document.createElement('script');
			script.src = 'https://accounts.google.com/gsi/client';
			script.async = true;
			document.head.appendChild(script);
			
			script.onload = initGoogleSignIn;
		} else {
			initGoogleSignIn();
		}
		
		function initGoogleSignIn() {
			window.google.accounts.id.initialize({
				client_id: '209539625617-o97333fo98qkd5dtd1c5otdd5abo4097.apps.googleusercontent.com',
				callback: handleGoogleSignIn
			});
			window.google.accounts.id.prompt();
		}
		
		async function handleGoogleSignIn(response) {
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
				location.hash = '/';
			} else {
				const err = document.querySelector("#error");
				err.innerHTML = json.message || json.error;
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
				const routeResolved = await resolveRoute('/');
				routeResolved();
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
		const link4 = createDiv('view4', register);
	link4.addEventListener('submit', async (e) => {
		e.preventDefault();
		var data = new FormData(document.querySelector('form'));
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

route('/', 'template1');
route('/pong', 'template-view1');
route('/tictactoe', 'template-view2');
route('/login', 'template-view3');
route('/register', 'template-view4');

route('/2fa/setup', 'template-2fa-setup');
route('/2fa/verify', 'template-2fa-verify');

template('template-profile', async () => {
	let myDiv = document.getElementById(appDiv);
	myDiv.innerHTML = "";
	const profileDiv = createDiv('profile', profile);
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
				`;
			} else {
				statusContainer.innerHTML = `
					<a href="#/2fa/setup" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
						Setup Two-Factor Authentication
					</a>
					<p class="text-sm text-gray-600 mt-2">Add an extra layer of security to your account.</p>
				`;
			}
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

route('/profile', 'template-profile');

let createDiv = (id, xmlString) => {
		let d = document.createElement('div');
		d.id = id;
		d.innerHTML = xmlString;
		return d.firstChild;
};

let createLink = (title, text, href) => {
		let a = document.createElement('a');
	a.classList = 'm-10 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-6 border border-gray-400 rounded shadow text-center';
		let linkText = document.createTextNode(text);
		a.appendChild(linkText);
		a.title = title;
		a.href = href;
		return a;
};

async function resolveRoute(route) {
	try {
	if (route == '/logout') {
		fetch(`${BASE}/logout`, {method: "DELETE" });
		location.hash = '#/login';
		return () => {};
	}
	else if (route == '/login' || route == '/register' || route == '/2fa/verify') {
		return routes[route];
	}
	else if (route == '/2fa/setup') {
		const response = await fetch(`${BASE}/status`, {
			credentials: "include"
		});
		if (response.status == 401) {
			location.hash = '#/login';
			return () => {};
		} else {
			const userData = await response.json();
			if (userData.user && userData.user.two_fa_enabled) {
				location.hash = '#/profile';
				return () => {};
			} else {
				return routes[route];
			}
		}
	}
	else {
		const response = await fetch(`${BASE}/status`, {
			credentials: "include"
		});
		if(response.status == 401){
			location.hash = '#/login';
			return () => {};
		} else {
			const json = await response.json();
			localStorage.setItem('TRANSCENDER_USER', JSON.stringify(json));
			return routes[route];
		}
	}
	} catch (error) {
		throw new Error("The route is not defined");
	}
}

let router = async (evt) => {
		const url = window.location.hash.slice(1) || "/";
		const routeResolved = await resolveRoute(url);
		routeResolved();
	if (url === '/pong')
		play(getLayoutPayloadPong, displayPong, 'pong');
	else if (url === '/tictactoe')
		play(getLayoutPayloadTicTacToe, displayTicTacToe, 'tictactoe');
};

window.addEventListener('load', router);
window.addEventListener('hashchange', router);