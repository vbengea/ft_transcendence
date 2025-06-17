

export const hydrateProfile = async (userId) => {
	try {
		const userCurr = JSON.parse(sessionStorage.TRANSCENDER_USER).user;
		const userData = await (await fetch(`/auth/you/${userId}`)).json();
		const isCurr = userCurr.id === userData.id;

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

		await loadFriends(userData.id);

		if (!isCurr) {
			document.querySelectorAll('#profile-wrapper button').forEach(b => b.remove());
			document.querySelector('#profile_footer').remove();
			document.querySelector('#friends-title').innerHTML = '';
		}

		if (isCurr) {
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

						const userData = JSON.parse(sessionStorage.TRANSCENDER_USER);
						userData.user.avatar = result.avatar;
						sessionStorage.TRANSCENDER_USER = JSON.stringify(userData);

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

			await loadFriendsRequests(userData.id);

			document.getElementById('find-friends-btn').addEventListener('click', () => {
				const findFriendsContainer = document.getElementById('find-friends-container');
				findFriendsContainer.classList.toggle('hidden');
			});

			document.getElementById('search-user-btn').addEventListener('click', searchUsers);

			document.getElementById('search-user').addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					searchUsers();
				}
			});
		}

		const statsResponse = await fetch(`/api/matches/${userData.id}`, {
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
				// TODO - Find the correct game at this point. 

				const isUser1 = match.user1Id === userData.id;
				const userScore = isUser1 ? match.user1Score : match.user2Score;
				const opponentScore = isUser1 ? match.user2Score : match.user1Score;

				if (userScore > opponentScore) {
					wins++;
					// if (match.gameType === 'pong') pongWins++;
					// if (match.gameType === 'tictactoe') tictactoeWins++;
				} else if (userScore < opponentScore) {
					losses++;
				}
				// const gameType = sessionStorage.getItem('selectedGame');
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

async function loadFriends(userId) {
	try {
		const response = await fetch(`/auth/friends/${userId}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const friends = await response.json();
			const friendsList = document.getElementById('friends-list');

			if (friends.length === 0) {
				friendsList.innerHTML = `
					<div class="col-span-2 flex items-center justify-center h-20 bg-gray-50 rounded-md">
						<span class="text-gray-500">You don't have any friends yet</span>
					</div>
				`;
			} else {
				friendsList.innerHTML = friends.map(friend => `
					<div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
						<div class="flex items-center">
							<img src="${friend.avatar}" alt="${friend.name}" class="w-10 h-10 rounded-full mr-3">
							<div class="flex-1">
								<div class="font-medium">${friend.name}</div>
								<div class="text-xs text-gray-500">${friend.email}</div>
							</div>
						</div>
						<button class="remove-friend px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700" data-id="${friend.id}">
							Remove
						</button>
					</div>
				`).join('');

				document.querySelectorAll('.remove-friend').forEach(button => {
					button.addEventListener('click', async () => {
						const friendId = button.getAttribute('data-id');
						if (confirm('Are you sure you want to remove this friend?')) {
							await removeFriend(userId, friendId);
						}
					});
				});
			}
		} else {
			console.error('Failed to load friends');
		}
	} catch (err) {
		console.error('Error loafind friends:', err);
	}
}

async function removeFriend(userId, friendId) {
	try {
		const respose = await fetch(`/auth/friends/${friendId}`, {
			method: 'DELETE',
			credentials: 'include'
		});

		if (respose.ok) {
			await loadFriends(userId);
		} else {
			const error = await respose.json();
			alert(`Error: ${error.error || 'Failed to remove friend'}`);
		}
	} catch (err) {
		console.error('Error removing friend:', err);
		alert('An error ocurred while removing the friend');
	}
}

async function loadFriendsRequests(userId) {
	try {
		const response = await fetch('/auth/friend-requests', {
			credentials: 'include'
		});

		if (response.ok) {
			const requests = await response.json();
			const requestsContainer = document.getElementById('friend-requests-container');
			const requestsList = document.getElementById('friend-requests');

			if (requests.length > 0) {
				requestsContainer.classList.remove('hidden');
				requestsList.innerHTML = requests.map(request => `
					<div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
						<div class="flex items-center">
							<img src="${request.sender.avatar}" alt="${request.sender.name}" class="w-10 h-10 rounded-full mr-3">
							<div>
								<div class="font-medium">${request.sender.name}</div>
								<div class="text-xs text-gray-500">${request.sender.email}</div>
							</div>
						</div>
						<div>
							<button class="accept-request px-3 py-1 bg-green-600 text-white rounded mr-2 hover:bg-green-700" data-id="${request.id}">
								Accept
							</button>
							<button class="reject-request px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" data-id="${request.id}">
								Reject
							</button>
						</div>
					</div>
				`).join('');

				document.querySelectorAll('.accept-request').forEach(button => {
					button.addEventListener('click', async () => {
						const requestId = button.getAttribute('data-id');
						await handleFriendRequest(userId, requestId, 'accept');
					});
				});

				document.querySelectorAll('.reject-request').forEach(button => {
					button.addEventListener('click', async () => {
						const requestId = button.getAttribute('data-id');
						await handleFriendRequest(userId, requestId, 'reject');
					});
				});
			} else {
				requestsContainer.classList.add('hidden');
			}
		} else {
			console.error('Failed to load friend requests');
		}
	} catch (err) {
		console.error('Error loading friend requests:', err);
	}
}

async function handleFriendRequest(userId, requestId, action) {
	try {
		const response = await fetch(`/auth/friend-requests/${requestId}/${action}`, {
			method: 'POST',
			credentials: 'include'
		});

		if(response.ok) {
			await loadFriends(userId);
			await loadFriendsRequests(userId);
		} else {
			const error = await response.json();
			alert(`Error: ${error.error || `Failed to ${action} friend request`}`);
		}
	} catch (err) {
		console.error(`Error ${action}ing friend request:`, err);
		alert(`An error ocurred while ${action}ing the friend request`);
	}
}

async function searchUsers() {
	const searchQuery = (document.getElementById('search-user') as HTMLInputElement).value.trim();
	const resultsContainer = document.getElementById('search-results');

	if (!searchQuery) {
		resultsContainer.innerHTML = `<p class="text-gray-500">Please enter a search term</p>`;
		return;
	}

	try {
		const response = await fetch(`/auth/users/search?q=${encodeURIComponent(searchQuery)}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const users = await response.json();

			if (users.length === 0) {
				resultsContainer.innerHTML = `<p class="text-gray-500">No users found</p>`;
			} else {
				resultsContainer.innerHTML = users.map(user => `
					<div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
						<div class="flex items-center">
							<img src="${user.avatar}" alt="${user.name}" class="w-10 h-10 rounded-full mr-3">
							<div>
								<div class="font-medium">${user.name}</div>
								<div class="text-xs text-gray-500">${user.email}</div>
							</div>
						</div>
						<button class="send-request px-3 py-1 ${user.friendStatus === 'none' ? 'bg-indigo-600 hover:bg-indigo-700' : ''} ${user.friendStatus === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''} ${user.friendStatus === 'friends' ? 'bg-green-600 hover:bg-green-700' : ''} text-white rounded" 
							data-id="${user.id}" ${user.friendStatus !== 'none' ? 'disabled' : ''}>
							${user.friendStatus === 'none' ? 'Add Friend' : ''}
							${user.friendStatus === 'pending' ? 'Request Sent' : ''}
							${user.friendStatus === 'friends' ? 'Friends' : ''}
						</button>
					</div>
				`).join('');

				document.querySelectorAll('.send-request').forEach(button => {
					if (button.getAttribute('disabled') !== 'disabled') {
						button.addEventListener('click', async () => {
							const userId = button.getAttribute('data-id');
							await sendFriendRequest(userId);
							button.textContent = 'Request Sent';
							button.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
							button.classList.add('bg-yellow-600', 'hover:bg-yellow-700');
							button.setAttribute('disabled', 'disabled');
						});
					}
				});
			}
		} else {
			const error = await response.json();
			resultsContainer.innerHTML = `<p class="text-red-500">${error.error || 'Error searching for users'}</p>`;
		}
	} catch (err) {
		console.error('Error searching users:', err);
		resultsContainer.innerHTML = `<p class="text-red-500">An error occurred while searching</p>`;
	}
}

async function sendFriendRequest(userId) {
	try {
		const response = await fetch('/auth/friend-requests', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ receiverId: userId })
		});

		if (!response.ok) {
			const error = await response.json();
			alert(`Error: ${error.error || 'Failed to send friend request'}`);
		}
	} catch (err) {
		console.error('Error sending friend request:', err);
		alert('An error ocurred while sending the friend request');
	}
}