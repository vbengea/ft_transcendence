import { validatePassword } from "../utils";
import { landing } from "../landing";
import { lang, loadLang } from "../events";

export const hydrateSettings = async () => {
	try {

		const setupTabs = () => {
			const tabButtons = document.querySelectorAll('.tab-button');
			const tabContents = document.querySelectorAll('.tab-content');

			tabButtons.forEach(button => {
				button.addEventListener('click', () => {
					tabButtons.forEach(btn => btn.classList.remove('active'));
					tabContents.forEach(content => content.classList.add('hidden'));

					button.classList.add('active');
					const tabId = button.id.replace('tab-', 'content-');
					document.getElementById(tabId).classList.remove('hidden');
				});
			});
		};

		const response = await fetch('/auth/status', {
			credentials: "include"
		});

		if (response.ok) {
			const userData = await response.json();
			const statusContainer = document.getElementById('2fa-status-container');

			doLang(userData);
			doCustom(userData);

			if (userData.user && userData.user.two_fa_enabled) {
				statusContainer.innerHTML = lang(`
					<div class="flex items-center mb-3">
						<svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
						<span class="text-gray-800">{{two_fa_enabled}}</span>
					</div>
					<p class="text-sm text-gray-600 mb-3">{{your_account_protected_2fa}}</p>
					<button id="disable-2fa" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
						{{disable_two_factor_authentication}}
					</button>
				`);

				setTimeout(() => {
					document.getElementById('disable-2fa').addEventListener('click', async () => {
						if (confirm(lang('{{are_you_sure_disable_2fa}}'))) {
							try {
								const response = await fetch('/auth/2fa', {
									method: 'DELETE',
									credentials: 'include',
								});

								const result = await response.json();
								if (response.ok) {
									alert(lang('{{two_fa_disabled_successfully}}'));
									location.reload();
								} else {
									alert(lang(`{{error}}: ${result.error || '{{failed_to_disable_2fa}}'}`));
								}
							} catch (err) {
								alert(lang('{{error_occurred_try_again}}'));
								console.log(err);
							}
						}
					});
				}, 100);
			} else {
				statusContainer.innerHTML = lang(`
					<button id="setup-2fa-btn" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
						{{setup_two_factor_authentication}}
					</button>
					<p class="text-sm text-gray-600 mt-2">{{add_extra_layer_security}}.</p>
					<div id="2fa-setup-container" class="hidden mt-6 p-4 bg-gray-50 rounded-md">
						<div class="text-center mb-4">
							<p class="mb-4">{{scan_this_qr}}:</p>
							<div id="qrcode-container" class="flex justify-center mb-4">
								<div class="animate-spin h-8 w-8 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
							</div>
							<p class="mt-4 text-sm text-gray-500">{{manual_qr}}:</p>
							<p id="manual-code" class="font-mono text-sm mt-2 p-2 bg-gray-100 rounded break-all overflow-auto max-w-full"></p>
						</div>
						
						<form id="2fa-verify-form" class="mt-6">
							<div>
								<label for="2fa-code" class="block text-sm font-medium text-gray-700 mb-1">{{verification_code}}</label>
								<input type="text" id="2fa-code" name="code" required 
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
								<p class="text-xs text-gray-500 mt-1">{{enter_verification_code}}</p>
							</div>
							<div id="2fa-error" class="text-red-500 text-sm hidden mt-2"></div>
							<button type="submit" class="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
								{{verify_2fa}}
							</button>
						</form>
					</div>
				`);

				setTimeout(() => {
					document.getElementById('setup-2fa-btn').addEventListener('click', async () => {
						const setupContainer = document.getElementById('2fa-setup-container');
						setupContainer.classList.remove('hidden');

						try {
							const response = await fetch('/auth/2fa/setup', {
								method: 'GET',
								credentials: 'include'
							});

							if (response.ok) {
								const data = await response.json();
								document.getElementById('qrcode-container').innerHTML = lang(`<img src="${data.qrcode}" alt="QR Code" class="border p-2 rounded">`);
								document.getElementById('manual-code').textContent = data.manualCode;
							} else {
								const result = await response.json();
								alert(lang(`{{error}}: ${result.error || '{{failed_to_load_2fa_setup}}'}`));
							}
						} catch (err) {
							console.error('Error setting up 2FA', err);
							alert(lang('{{error_setting_up_2fa}}'));
						}
					});

					document.getElementById('2fa-verify-form').addEventListener('submit', async (e) => {
						e.preventDefault();
						const code = (document.getElementById('2fa-code') as HTMLInputElement).value;
						const errorElement = document.getElementById('2fa-error');

						errorElement.textContent = '';
						errorElement.classList.add('hidden');

						try {
							const response = await fetch('/auth/2fa/verify', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								credentials: 'include',
								body: JSON.stringify({ token: code })
							});

							if (response.ok) {
								alert(lang('{{two_fa_enabled_successfully}}'));
								location.reload();
							} else {
								const result = await response.json();
								errorElement.textContent = lang(result.error || '{{failed_to_verify_code}}');
								errorElement.classList.remove('hidden');
							}
						} catch (err) {
							console.error('Error verifying 2FA code:', err);
							errorElement.textContent = lang('{{error_occurred_try_again}}');
							errorElement.classList.remove('hidden');
						}
					});
				}, 100);
			}

			setTimeout(() => {
				const passwordForm = document.getElementById('password-reset-form');
				if (passwordForm) {
					passwordForm.addEventListener('submit', async (e) => {
						e.preventDefault();

						const currentPassword = (document.getElementById('current-password') as HTMLInputElement).value;
						const newPassword = (document.getElementById('new-password') as HTMLInputElement).value;
						const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;
						const errorElement = document.getElementById('password-error');

						errorElement.textContent = '';
						errorElement.classList.add('hidden');

						if (!newPassword.trim()) {
							errorElement.textContent = lang('{{password_cannot_be_empty}}');
							errorElement.classList.remove('hidden');
							return;
						}

						if (newPassword !== confirmPassword) {
							errorElement.textContent = lang('{{passwords_do_not_match}}');
							errorElement.classList.remove('hidden');
							return;
						}

						const validPass = validatePassword(newPassword);
						if (!validPass.valid) {
							errorElement.textContent = validPass.message;
							errorElement.classList.remove('hidden');
							return;
						}

						try {
							const response = await fetch('/auth/password', {
								method: 'PUT',
								headers: {
									'Content-Type': 'application/json'
								},
								credentials: 'include',
								body: JSON.stringify({
									currentPassword,
									newPassword
								})
							});

							if (response.ok) {
								alert(lang('{{password_updated_successfully}}'));
								(passwordForm as HTMLFormElement).reset();
							} else {
								const result = await response.json();
								errorElement.textContent = lang(result.error || '{{failed_to_update_password}}');
								errorElement.classList.remove('hidden');
							}
						} catch (err) {
							console.error('Error updating password:', err);
							errorElement.textContent = lang('{{error_occurred_try_again}}');
							errorElement.classList.remove('hidden');
						}
					});
				}
			})

			setTimeout(() => {			document.getElementById('delete-account').addEventListener('click', async () => {
				if (confirm(lang('{{are_you_sure_delete_account}}'))) {
					const confirmText = prompt(lang('{{type_delete_to_confirm}}'));
					if (confirmText === 'DELETE') {
						try {
							const response = await fetch('/auth/account', {
								method: 'DELETE',
								credentials: 'include',
							});

							if (response.ok) {
								alert(lang('{{account_deleted_successfully}}'));
								location.hash = '#/login';
							} else {
								const result = await response.json();
								alert(lang(`{{error}}: ${result.error || '{{failed_to_delete_account}}'}`));
							}
						} catch (err) {
							alert(lang('{{error_occurred_try_again}}'));
							console.error(err);
						}
					} else if (confirmText !== null) {
						alert(lang('{{account_deletion_cancelled}}'))
					}
				}
			});
			}, 100);

			setupTabs();
		} else {
			const statusContainer = document.getElementById('2fa-status-container');
			statusContainer.innerHTML = lang(`
				<div class="text-red-500">
					<p>{{authentication_error_login}}</p>
				</div>
			`);
			setupTabs();
		}
	} catch (err) {
		console.error("Error fetching user data:", err);
		const statusContainer = document.getElementById('2fa-status-container');
		statusContainer.innerHTML = lang(`
			<div class="text-red-500">
				<p>{{error_connecting_server}}</p>
			</div>
		`);
	}
};

async function doLang(userData) {
	const combo : HTMLOptionElement = document.querySelector(`#${userData.user.lang}`);
	const lang : HTMLOptionElement = document.querySelector(`#languages`);
	combo.selected = true;
	lang.addEventListener('change', async (e) => {
		const data = JSON.parse(sessionStorage.TRANSCENDER_USER);
		const lg = (e.target as HTMLSelectElement).value;
		sessionStorage.lang = lg;
		await fetch(`/auth/lang/${lg}`, { method: 'PATCH' });
		await loadLang(lg);
		data.user.lang = lg;
		sessionStorage.TRANSCENDER_USER = JSON.stringify(data);
		let url = window.location.hash.slice(1) || "/";
		landing(url.slice(9));
	});
}

async function doCustom({ user: { customization } }) {
	const cuz : HTMLOptionElement = document.querySelector(`#customizations`);
	const def : HTMLOptionElement = document.querySelector(`#default_settings`);
	const score : HTMLOptionElement = document.querySelector(`#game_score`);
	const map : HTMLInputElement = document.querySelector(`#map_radio_${customization.map}`);
	const color : HTMLInputElement = document.querySelector(`#color_radio_${customization.color}`);
	const camera : HTMLInputElement = document.querySelector(`#camera_radio_${customization.camera}`);

	score.value = customization.score_max;
	map.checked = true;
	color.checked = true;
	camera.checked = true;

	def.addEventListener('click', async (_e) => {
		await fetch(`/auth/customization/${customization.id}`, { 
			method: 'PATCH',
			body: JSON.stringify({ 
				score_max: 10,
				map: 1,
				color: 7,
				camera: 3
			})
		});
		let url = window.location.hash.slice(1) || "/";
		landing(url.slice(9));
	})

	cuz.addEventListener('change', async (e) => {
		const el = (e.target as HTMLInputElement);
		await fetch(`/auth/customization/${customization.id}`, { 
			method: 'PATCH',
			body: JSON.stringify({ [`${el.dataset.name}`]: parseInt(el.dataset.value || el.value) })
		});
	});
}
