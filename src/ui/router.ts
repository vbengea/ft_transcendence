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

const links = `	<div class="absolute right-2 top-2 z-1000 inline-flex rounded-md shadow-xs">
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
    const link3 = createDiv('view3', login);
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
		if(response.ok)
		{
			const routeResolved = await resolveRoute('/');
			routeResolved();
		}
		else
		{
			const err = document.querySelector("#error");
			err.innerHTML = json.message;
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
			err.innerHTML = json.message;
		}
	});
    return myDiv.appendChild(link4);
});

route('/', 'template1');
route('/pong', 'template-view1');
route('/tictactoe', 'template-view2');
route('/login', 'template-view3');
route('/register', 'template-view4');

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
	else if (route == '/login' || route == '/register') {
		return routes[route];
	}
	else {
		const response = await fetch(BASE);
		if(response.status == 401){
			location.hash = '#/login';
			return () => {};
		} else {
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