import { initWebSocket, WS, closeWS, lang, loadLang } from './events';
import { landing } from './landing';
import { Templates } from './hydrates/templates';
import { validatePassword } from './utils';

const appDiv = "app";

let routes = {};
let templates = {};

const BASE = '/auth';

let template = (name, templateFunction) => {
	return templates[name] = templateFunction;
};

let route = async (path, template) => {
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
			err.innerHTML = lang(json.message || json.error);
		}
	});

	return myDiv.appendChild(verifyDiv);
});

template('template-view3', async () => {
	let myDiv = document.getElementById(appDiv);
	myDiv.innerHTML = "";
	const link3 = createDiv('view3', Templates.login) as HTMLElement;
	myDiv.appendChild(link3);

	const googleButtonContainer = link3.querySelector('#google-signin');
	
	const configResponse = await fetch(`${BASE}/config`);
	const config = await configResponse.json();

	if (!(window as any).google) {
		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		document.head.appendChild(script);
		
		script.onload = () => {
			setTimeout(() => {
				initGoogleSignIn(config.googleClientId, googleButtonContainer);
			}, 100);
		};
	} else {
		initGoogleSignIn(config.googleClientId, googleButtonContainer);
	}

	const formContainer = link3.querySelector('form').closest('div');

	const footerContainer = document.createElement('div');
	footerContainer.className = 'mt-6 text-center';

	const cookieNotice = document.createElement('p');
	cookieNotice.className = 'text-xs text-gray-500 mt-4 mx-auto';
	cookieNotice.style.maxWidth = '384px';
	cookieNotice.style.overflowWrap = 'break-word';
	cookieNotice.innerHTML = lang(`{{using_services}}. 
		<a href="#/privacy" class="text-indigo-600 hover:underline">{{learn_more}}</a>`);

	footerContainer.appendChild(cookieNotice);

	if (formContainer && formContainer.parentNode) {
		formContainer.parentNode.appendChild(footerContainer);
	}
	
	function initGoogleSignIn(clientId, container) {
		(window as any).google.accounts.id.initialize({
			client_id: clientId,
			callback: handleGoogleSignIn,
			context: 'signin',
			error_callback: (error) => {
				console.error('Google Sign In Error:', error);
				const err = document.querySelector("#error");
				err.innerHTML = lang("An error occurred with Google Sign In. Please try again.");
			}
		});

		(window as any).google.accounts.id.renderButton(
			container,
			{
				type: 'standard',
				theme: 'outline',
				size: 'large',
				shape: 'rectangular',
				text: 'continue_with',
				logo_alignment: 'center',
				width: container.offsetWidth
			}
		);

		(window as any).google.accounts.id.disableAutoSelect();
	}
	
	async function handleGoogleSignIn(response) {
		try {
			const id_token = response.credential;
			
			const resp = await fetch(`${BASE}/google`, {
				method: "POST",
				body: JSON.stringify({ id_token }),
				headers: {
					"Content-Type": "application/json"
				},
				credentials: 'include'
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
				err.innerHTML = lang(json.message || json.error);
			}
		} catch (error) {
			console.error('Error handling Google Sign In:', error);
			const err = document.querySelector("#error");
			err.innerHTML = lang("An error occurred with Google Sign In. Please try again.");
		}
	}

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
			err.innerHTML = lang(json.message || json.error);
		}
	});	
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
			errorElement.innerHTML = lang("Passwords do not match");
		} else {
			errorElement.innerHTML = "";
		}
	});

	const formContainer = link4.querySelector('form').closest('div');

	const footerContainer = document.createElement('div');
	footerContainer.className = 'mt-6 text-center';

	const cookieNotice = document.createElement('p');
	cookieNotice.className = 'text-xs text-gray-500 mx-auto';
	cookieNotice.style.maxWidth = '384px';
	cookieNotice.style.overflowWrap = 'break-word';
	cookieNotice.innerHTML = lang('By using our services, you agree to our use of essential cookies for authentication and security. <a href="#/privacy" class="text-indigo-600 hover:underline">Learn more</a>');

	footerContainer.appendChild(cookieNotice);

	if (formContainer && formContainer.parentNode) {
		formContainer.parentNode.appendChild(footerContainer);
	}

link4.addEventListener('submit', async (e) => {
	e.preventDefault();
	var data = new FormData(document.querySelector('form'));
	const password = data.get('password');

	const validPass = validatePassword(password);
	if (!validPass.valid) {
		const err = document.querySelector('#error');
		err.innerHTML = lang(validPass.message);
		return;
	}

	if (password !== data.get('confirm-password')) {
		const err = document.querySelector("#error");
		err.innerHTML = lang("Passwords do not match");
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
		err.innerHTML = lang(json.message || json.error);
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

route('/privacy', async () => {
	let myDiv = document.getElementById(appDiv);
	myDiv.innerHTML = "";

	try {
		const content = await fetch(`./pages/privacy.html`).then(res => res.text());

		const privacyPage = document.createElement('div');
		const processedContent = lang(content);

		privacyPage.id = 'privacy.page';
		privacyPage.innerHTML = lang(`
			<div class="min-h-screen bg-gray-100 py-8">
				<div class="container mx-auto px-4">
					<div class="bg-white rounded-lg shadow p-6">
						<div class="mb-6 flex justify-between items-center">
							<h1 class="text-3xl font-bold">Privacy Policy</h1>
							<a href="#/login" class="text-indigo-600 hover:underline">Return to Login</a>
						</div>
						${processedContent}
					</div>
				</div>
			</div>
		`);
		return myDiv.appendChild(privacyPage);
	} catch (err) {
		console.error(err);
		return myDiv.innerHTML = lang('<div class="text-center py-10">Unable to load Privacy Policy</div>');
	}
});

let createDiv = (id, xmlString) => {
	let d = document.createElement('div');
	d.id = id;
	d.innerHTML = lang(xmlString);
	return d.firstChild;
};

async function authorized() {
	const response = await fetch(`${BASE}/status`, { credentials: "include" });
	let raw = { authenticated: false, user: { lang: 'en_EN' } };
	try { raw = await response.json(); } catch (e) {}
	if (response.status == 401 || !raw.authenticated) {
		location.hash = '#/login';
		return false;
	} else {
		sessionStorage.setItem('TRANSCENDER_USER', JSON.stringify(raw));
		sessionStorage.lang = raw.user.lang;
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
			sessionStorage.lang = '';
			sessionStorage.langRaw = '';
			location.hash = '#/login';
			closeWS();
			return () => {};
		} else if (route == '/login' || route == '/register' || route == '/2fa/verify' || route == '/privacy') {
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
	if (!sessionStorage.lang)
		await loadLang("en_EN");
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