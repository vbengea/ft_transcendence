import { lang } from '../events';

export namespace Templates {
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

	export const login = lang(`<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-sm">
			<img class="mx-auto h-10 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company">
			<h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">{{sign_in_to_account}}</h2>
		</div>

		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
			<form class="space-y-6" action="#" method="POST">
				<div>
					<label for="email" class="block text-sm/6 font-medium text-gray-900">{{email_address}}</label>
					<div class="mt-2">
						<input type="email" name="email" id="email" value="" autocomplete="email" maxlength="100" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
					</div>
				</div>

				<div>
					<div class="flex items-center justify-between">
						<label for="password" class="block text-sm/6 font-medium text-gray-900">{{password}}</label>
					</div>
					<div class="mt-2">
						<input type="password" name="password" id="password" value="" autocomplete="current-password" maxlength="72" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
					</div>
				</div>

				<div>
					<button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{{sign_in}}</button>
				</div>
			</form>

			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300"></div>
					</div>
					<div class="relative flex justify-center text-sm font-medium leading-6">
						<span class="bg-white px-6 text-gray-900">{{or_continue_with}}</span>
					</div>
				</div>

				<div class="mt-6">
					<div id="google-signin" class="flex justify-center">
					</div>
				</div>
			</div>

			<p class="mt-10 text-center text-sm/6 text-gray-500">
				{{want_to_member}}
				<a href="#/register" class="font-semibold text-indigo-600 hover:text-indigo-500">{{register}}</a>
			</p>

			<p id="error" class="mt-10 text-center text-sm/6 text-red-600"></p>
		</div>
	</div>`);

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
};