
namespace Templates {
	export const twofa_setup = `<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-sm">
			<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Set Up Two-Factor Authentication</h2>
		</div>

		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
			<div class="text-center mb-6">
				<p class="mb-4">Scan this QR code with your authenticator app:</p>
				<div id="qrcode-container" class="flex justify-center"></div>
				<p class="mt-4 text-sm text-gray-500">Or enter this code manually:</p>
				<p id="manual-code" class="font-mono text-sm mt-2 p-2 bg-gray-100 rounded break-all overflow-auto max-w-full"></p>
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

	export const twofa_verify = `<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
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

	export const links = `	<div class="absolute right-2 top-2 z-1000 inline-flex rounded-md shadow-xs">
		<a href="#/profile" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
			Profile
		</a>
		<a href="#/pong" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-l-0 border-r-0 border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
			Pong
		</a>
		<a href="#/tictactoe" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
			Tic tac toe
		</a>
		<a href="#/logout" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
			Logout
		</a>
		</div>`;


	export const spash = `<div id="splash" class="bg-black absolute flex-col place-items-center h-screen w-screen top-0 invisible">
		<div id="log" class="text-gray-50 text-center mt-5"></div>
	</div>`;

	export const pong = `<div id="pong" class="absolute flex  w-screen h-screen bg-black">
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

	export const tictactoe = `<div id="tictactoe" class="absolute flex items-center justify-center w-screen h-screen">
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

	export const login = `<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-sm">
			<img class="mx-auto h-10 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company">
			<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign in to your account</h2>
		</div>

		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
			<form class="space-y-6" action="#" method="POST">
				<div>
					<label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
					<div class="mt-2">
						<input type="email" name="email" id="email" autocomplete="email" maxlength="100" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
					</div>
				</div>

				<div>
					<div class="flex items-center justify-between">
						<label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
					</div>
					<div class="mt-2">
						<input type="password" name="password" id="password" autocomplete="current-password" maxlength="72" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
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

	export const register = `<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-sm">
			<img class="mx-auto h-10 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company">
			<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Registration</h2>
		</div>

		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
			<form class="space-y-6" action="#" method="POST">
				<div>
					<label for="name" class="block text-sm/6 font-medium text-gray-900">Your name</label>
					<div class="mt-2">
						<input type="text" name="name" id="name" autocomplete="name" maxlength="50" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
					</div>
				</div>

				<div>
					<label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
					<div class="mt-2">
						<input type="email" name="email" id="email" autocomplete="email" maxlength="100" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
					</div>
				</div>

				<div>
					<div class="flex items-center justify-between">
						<label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
					</div>
					<div class="mt-2">
						<input type="password" name="password" id="password" autocomplete="current-password" maxlength="72" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
					</div>
				</div>

				<div>
					<div class="flex items-center justify-between">
						<label for="confirm-password" class="block text-sm/6 font-medium text-gray-900">Confirm Password</label>
					</div>
					<div class="mt-2">
						<input type="password" name="confirm-password" id="confirm-password" autocomplete="new-password" maxlength="72" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
					</div>
				</div>
				<div>
					<button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Register</button>
				</div>
			</form>

		<p id="error" class="mt-10 text-center text-sm/6 text-red-600"></p>
		</div>
	</div>`;

	export const profile = `<div class="p-8 max-w-2xl mx-auto">
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
}