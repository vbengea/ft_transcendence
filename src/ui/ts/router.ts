import { initWebSocket, WS, closeWS } from './events';
import { landing } from './landing';
import { Templates } from './hydrates/templates';

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

		if (!(window as any).google) {
			const script = document.createElement('script');
			script.src = 'https://accounts.google.com/gsi/client';
			script.async = true;
			document.head.appendChild(script);
			
			script.onload = () => {
				setTimeout(() => {
					initGoogleSignIn(config.googleClientId);
				}, 100);
			};
		} else {
			initGoogleSignIn(config.googleClientId);
		}
		
		function initGoogleSignIn(clientId) {
			(window as any).google.accounts.id.initialize({
				client_id: clientId,
				callback: handleGoogleSignIn,
				ux_mode: 'popup',
				context: 'signin',
				error_callback: (error) => {
					console.error('Google Sign In Error:', error);
					const err = document.querySelector("#error");
					err.innerHTML = "An error occurred with Google Sign In. Please try again.";
				}
			});
			(window as any).google.accounts.id.prompt();
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

route('/profile', () => {
	location.hash = '#/landing/profile';
	return () => {};
});

route('/', 'template1');
route('/login', 'template-view3');
route('/register', 'template-view4');
route('/2fa/verify', 'template-2fa-verify');

let createDiv = (id, xmlString) => {
	let d = document.createElement('div');
	d.id = id;
	d.innerHTML = xmlString;
	return d.firstChild;
};

async function authorized() {
	const response = await fetch(`${BASE}/status`, { credentials: "include" });
	let raw = { authenticated: false };
	try { raw = await response.json(); } catch (e) {}
	if (response.status == 401 || !raw.authenticated) {
		location.hash = '#/login';
		return false;
	} else {
		sessionStorage.setItem('TRANSCENDER_USER', JSON.stringify(raw));
		if (WS === null){
			initWebSocket();
		}
	}
	return true;
}

async function resolveRoute(route) {
	try {
		if (route == '/logout') {
			fetch(`${BASE}/logout`, { method: "DELETE" });
			sessionStorage.TRANSCENDER_USER = '';
			location.hash = '#/login';
			closeWS();
			return () => {};
		} else if (route == '/login' || route == '/register' || route == '/2fa/verify') {
			return routes[route];
		} else if (route == '/2fa/setup') {
			if (authorized()) {
				location.hash = '#/landing/settings';
				return () => {};
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

async function router(evt) {
	let url = window.location.hash.slice(1) || "/";
	if (url.startsWith('/landing/')) {
		if (await authorized())
			landing(url.slice(9));
	} else {
		const routeResolved = await resolveRoute(url);
		if (routeResolved)
			routeResolved();
		testUsers();
	}
};

addEventListener('load', router);
addEventListener('hashchange', router);