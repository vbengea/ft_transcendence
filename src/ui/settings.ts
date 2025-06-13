const hydrateSettings = async () => {
	try {
		const response = await fetch('/auth/status', {
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
								const response = await fetch('/auth/2fa', {
									method: 'DELETE',
									credentials: 'include',
								});

								const result = await response.json();
								if (response.ok) {
									alert('2FA has been disabled successfully');
									location.reload();
								} else {
									alert(`Error: ${result.error || 'Failed to disable 2FA'}`);
								}
							} catch (err) {
								alert('An error occurred. Please try again.');
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

			setTimeout(() => {
				document.getElementById('delete-account').addEventListener('click', async () => {
					if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
						const confirmText = prompt('Type "DELETE" to confirm account deletion:');
						if (confirmText === 'DELETE') {
							try {
								const response = await fetch('/auth/account', {
									method: 'DELETE',
									credentials: 'include',
								});

								if (response.ok) {
									alert('Your account has been deleted successfully');
									location.hash = '#/login';
								} else {
									const result = await response.json();
									alert(`Error: ${result.error || 'Failed to delete account'}`);
								}
							} catch (err) {
								alert('An error occurred. Please try again.');
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
					<p>Authentication error. Please <a href="#/login" class="text-indigo-600 hover:underline">log in</a> to view your settings.</p>
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
};
