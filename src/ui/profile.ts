

const hydrateProfile = async () => {
	try {
		const userData = JSON.parse(localStorage.TRANSCENDER_USER).user;

		const avatarElement = document.getElementById('profile-avatar');

		avatarElement.setAttribute('src', userData.avatar);
		document.getElementById('profile-name').textContent = userData.name;
		document.getElementById('profile-email').textContent = userData.email;

		const avatarContainer = avatarElement.parentElement;

		const avatarOverlay = document.createElement('div');
		avatarOverlay.className = 'absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer';
		avatarOverlay.innerHTML = '<span class="text-white text-sm">Change Avatar</span>';

		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*';
		fileInput.className = 'hidden';
		fileInput.id = 'avatar-upload';

		avatarContainer.style.position = 'relative';

		avatarContainer.appendChild(avatarOverlay);
		avatarContainer.appendChild(fileInput);

		avatarOverlay.addEventListener('click', () => {
			fileInput.click();
		});

		fileInput.addEventListener('change', async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) {
				return;
			}

			if (!file.type.startsWith('image/')) {
				alert('Please select an image file');
				return;
			}

			if (file.size > 2 * 1024 * 1024) {
				alert('Image size should be less than 2MB');
				return;
			}

			const formData = new FormData();
			formData.append('avatar', file);

			try {
				avatarElement.style.opacity = '0.5';

				const response = await fetch('auth/avatar', {
					method: 'POST',
					credentials: 'include',
					body: formData
				});

				if (response.ok) {
					const result = await response.json();

					avatarElement.setAttribute('src', result.avatar + '?t=' + new Date().getTime());

					const userData = JSON.parse(localStorage.TRANSCENDER_USER);
					userData.user.avatar = result.avatar;
					localStorage.TRANSCENDER_USER = JSON.stringify(userData);

					const menuAvatar = document.querySelector('#user_inner_3');
					if (menuAvatar) {
						menuAvatar.setAttribute('src', result.avatar + '?=' + new Date().getTime());
					}
				} else {
					const error = await response.json();
					alert(`Error: ${error.message || 'Failed to update avatar'}`);
				}
			} catch (err) {
				console.error('Error uploading avatar:', err);
				alert('An error ocurred while uploading the avatar');
			} finally {
				avatarElement.style.opacity = '1';
			}
		});

		const statsResponse = await fetch('/api/matches', {
			credentials: 'include'
		});

		if (statsResponse.ok) {
			const matches = await statsResponse.json();

			const totalGames = matches.length;
			let wins = 0;
			let losses = 0;
			let pongGames = 0;
			let pongWins = 0;
			let tictactoeGames = 0;
			let tictactoeWins = 0;

			matches.forEach(match => {

				const isUser1 = match.user1Id === userData.id;
				const userScore = isUser1 ? match.user1Score : match.user2Score;
				const opponentScore = isUser1 ? match.user2Score : match.user1Score;

				if (userScore > opponentScore) {
					wins++;
					if (match.gameType === 'pong') pongWins++;
					if (match.gameType === 'tictactoe') tictactoeWins++;
				} else if (userScore < opponentScore) {
					losses++;
				}

				// const gameType = sessionStorage.getItem('selectedGame');
				// TODO - Find the correct game at this point. 

				// if (gameType === 'pong') pongGames++;
				// if (gameType === 'tictactoe') tictactoeGames++;
			});

			document.getElementById('total-games').textContent = totalGames.toString();
			document.getElementById('total-wins').textContent = wins.toString();
			document.getElementById('total-losses').textContent = losses.toString();

			const pongWinRate = pongGames > 0 ? Math.round((pongWins / pongGames) * 100) : 0;
			const tictactoeWinRate = tictactoeGames > 0 ? Math.round((tictactoeWins / tictactoeGames) * 100) : 0;

			document.getElementById('pong-win-rate').textContent = `${pongWinRate}% (${pongWins}/${pongGames})`;
			document.getElementById('pong-progress').style.width = `${pongWinRate}%`;

			document.getElementById('tictactoe-win-rate').textContent = `${tictactoeWinRate}% (${tictactoeWins}/${tictactoeGames})`;
			document.getElementById('tictactoe-progress').style.width = `${tictactoeWinRate}%`;
		} else {
			console.error("Error fetching matches data");
		}
	} catch (err) {
		console.error("Error in profile page:", err);
	}
}

