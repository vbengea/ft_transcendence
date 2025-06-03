const appDiv = "app";

let routes = {};
let templates = {};

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

const spash = `<div id="splash" class="bg-black absolute flex-col place-items-center h-screen w-screen top-0 invisible">
	<div class="mt-0"><img class="w-100 h-100" src="pong.png"></div>
	<div id="log" class="text-gray-50 text-center mt-5"></div>
</div>`;

const pong = `<div id="pong" class="absolute flex  w-screen h-screen bg-black">
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

template('template1', () => {
    const myDiv = document.getElementById(appDiv);
    myDiv.innerHTML = "";
    const link1 = createLink('view1', 'Pong', '#/pong');
    const link2 = createLink('view2', 'Tict Tac Toe', '#/tictactoe');
	const div = document.createElement('div');
	div.classList = "grid h-56 grid-cols-2 content-normal items-center gap-4 ...";
	div.appendChild(link1);
	div.appendChild(link2);
    return myDiv.appendChild(div);
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

route('/', 'template1');
route('/pong', 'template-view1');
route('/tictactoe', 'template-view2');

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

let resolveRoute = (route) => {
    try {
     return routes[route];
    } catch (error) {
        throw new Error("The route is not defined");
    }
};

let router = (evt) => {
    const url = window.location.hash.slice(1) || "/";
    const routeResolved = resolveRoute(url);
    routeResolved();
	if (url === '/pong')
		play(getLayoutPayloadPong, displayPong, 'pong');
	else if (url === '/tictactoe')
		play(getLayoutPayloadTicTacToe, displayTicTacToe, 'tictactoe');
};

window.addEventListener('load', router);
window.addEventListener('hashchange', router);