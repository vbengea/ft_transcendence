import { fetchOnlineStatus } from "../utils";
import { lang } from "../events";

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
		avatarOverlay.innerHTML = lang('<span class="text-white text-sm">{{change_avatar}}</span>');

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

			const profileNameElement = document.getElementById('profile-name');

			const nameContainer = document.createElement('div');
			nameContainer.className = 'relative inline-block';
			nameContainer.style.cursor = 'pointer';

			const parentElement = profileNameElement.parentElement;
			parentElement.replaceChild(nameContainer, profileNameElement);
			nameContainer.appendChild(profileNameElement);

			const nameOverlay = document.createElement('div');
			nameOverlay.className = 'absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center hover:bg-opacity-10 transition-opacity';
			nameOverlay.innerHTML = lang('<span class="text-transparent hover:text-indigo-600 text-sm flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>{{edit}}</span>');

			nameContainer.addEventListener('click', () => {
				showNameEditForm(profileNameElement, userData);
			});


			avatarOverlay.addEventListener('click', () => {
				fileInput.click();
			});

			fileInput.addEventListener('change', async (e) => {
				const file = (e.target as HTMLInputElement).files?.[0];
				if (!file) {
					return;
				}

				if (!file.type.startsWith('image/')) {
					alert(lang('{{select_image_file}}'));
					return;
				}

				if (file.size > 2 * 1024 * 1024) {
					alert(lang('{{image_size_limit}}'));
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
						alert(lang('{{avatar_upload_error}}'));
					}
				} catch (err) {
					console.error('Error uploading avatar:', err);
					alert(lang('{{avatar_upload_error}}'));
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
				const isUser1 = match.user1Id === userData.id;
				const userScore = isUser1 ? match.user1Score : match.user2Score;
				const opponentScore = isUser1 ? match.user2Score : match.user1Score;

				if (match.winScore === 10) {
					pongGames++;
					if (userScore > opponentScore) {
						wins++;
						pongWins++;
					} else if (userScore < opponentScore) {
						losses++;
					}
				} else if (match.winScore === 3) {
					tictactoeGames++;
					if (userScore > opponentScore) {
						tictactoeWins++;
						wins++;
					} else if (userScore < opponentScore) {
						losses++;
					}
				} else {
					if (userScore > opponentScore) {
						wins++;
					} else if (userScore < opponentScore) {
						losses++;
					}
				}
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

async function showNameEditForm(nameElement, userData) {
	const form = document.createElement('form');
	form.className = 'flex flex-col space-y-2 mt-2 w-full';

	const input = document.createElement('input');
	input.type = 'text';
	input.value = userData.name;
	input.className = 'px-2 py-1 border border-indigo-300 rounded text-lg font-bold w-full';
	input.maxLength = 50;

	const buttonsContainer = document.createElement('div');
	buttonsContainer.className = 'flex space-x-2 justify-center';

	const saveButton = document.createElement('button');
	saveButton.type = 'submit';
	saveButton.className = 'bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm';
	saveButton.textContent = lang('{{save}}');

	const cancelButton = document.createElement('button');
	cancelButton.type = 'button';
	cancelButton.className = 'bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 text-sm';
	cancelButton.textContent = lang('{{cancel}}');

	buttonsContainer.appendChild(saveButton);
	buttonsContainer.appendChild(cancelButton);

	form.appendChild(input);
	form.appendChild(buttonsContainer);

	const nameContainer = nameElement.parentElement;
	const originalElement = nameElement;
	const originalText = nameElement.textContent;

	nameContainer.style.display = 'none';

	const profileSection = nameContainer.parentElement;
	profileSection.insertBefore(form, nameContainer.nextSibling);

	input.focus();
	input.select();

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const newName = input.value.trim();

		if (!newName) {
			alert('Name cannot be empty');
			return;
		}

		if (newName === userData.name) {
			nameContainer.style.display = '';
			form.remove();
			return;
		}

		try {
			const response = await fetch('/auth/username', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({ name: newName })
			});

			if (response.ok) {
				nameElement.textContent = newName;

				const userSession = JSON.parse(sessionStorage.TRANSCENDER_USER);
				userSession.user.name = newName;
				sessionStorage.TRANSCENDER_USER = JSON.stringify(userSession);

				nameContainer.style.display = '';
				form.remove();

				const successMessage = document.createElement('div');
				successMessage.className = 'text-green-600 text-sm mt-1';
				successMessage.textContent = lang('{{username_update_success}}');
				profileSection.insertBefore(successMessage, nameContainer.nextSibling);

				setTimeout(() => {
					if (profileSection.contains(successMessage)) {
						profileSection.removeChild(successMessage);
					}
				}, 3000);
			} else {
				alert(lang('{{username_update_fail}}'));
			}
		} catch (err) {
			console.error('Error updating username:', err);
			alert(lang('{{username_update_fail}}'));
		}
	});

	cancelButton.addEventListener('click', () => {
		nameContainer.style.display = '';
		form.remove();
	});

	input.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			nameContainer.style.display = '';
			form.remove();
		}
	});
}

async function loadFriends(userId) {
	try {
		const response = await fetch(`/auth/friends/${userId}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const friends = await response.json();
			const friendsList = document.getElementById('friends-list');

			const userCurr = JSON.parse(sessionStorage.TRANSCENDER_USER).user;
			const isCurr = userCurr.id === userId;

			if (friends.length === 0) {
				friendsList.innerHTML = lang(`
					<div class="col-span-2 flex items-center justify-center h-20 bg-gray-50 rounded-md">
						<span class="text-gray-500">{{no_friends}}</span>
					</div>
				`);
			} else {
				const onlineStatuses = isCurr ? await fetchOnlineStatus(friends) : {};

				friendsList.innerHTML = friends.map(friend => {
					const statusIndicator = isCurr ? 
						lang(`<span data-friend-id="${friend.id}" class="absolute bottom-0 right-0 transform translate-y-1/4 w-2.5 h-2.5 ${onlineStatuses[friend.id] ? 'bg-green-400' : 'bg-gray-400'} border-2 border-white rounded-full" title="${onlineStatuses[friend.id] ? 'Online' : 'Offline'}"></span>`) : 
						'';
						
					return lang(`
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
						<div class="flex items-center">
							<div class="relative">
							<img src="${friend.avatar}" alt="${friend.name}" class="w-10 h-10 rounded-full mr-3">
							${statusIndicator}
							</div>
							<div class="flex-1">
							<div class="font-medium">${friend.name}</div>
							<div class="text-xs text-gray-500">${friend.email}</div>
							</div>
						</div>
						<button class="remove-friend px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700" data-id="${friend.id}">
							{{remove}}
						</button>
						</div>
					`);
				}).join('');

				document.querySelectorAll('.remove-friend').forEach(button => {
					button.addEventListener('click', async () => {
						const friendId = button.getAttribute('data-id');
						if (confirm(lang('{{remove_friend_confirm}}'))) {
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
			alert(lang('{{remove_friend_error}}'));
		}
	} catch (err) {
		console.error('Error removing friend:', err);
		alert(lang('{{remove_friend_error}}'));
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
				requestsList.innerHTML = requests.map(request => lang(`
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
								{{accept}}
							</button>
							<button class="reject-request px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" data-id="${request.id}">
								{{reject}}
							</button>
						</div>
					</div>
				`)).join('');

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
			alert(lang(`{{error_${action}_friend_request}}`));
		}
	} catch (err) {
		console.error(`Error ${action}ing friend request:`, err);
		alert(lang(`{{error_${action}_friend_request}}`));
	}
}

async function searchUsers() {
	const searchQuery = (document.getElementById('search-user') as HTMLInputElement).value.trim();
	const resultsContainer = document.getElementById('search-results');

	if (!searchQuery) {
		resultsContainer.innerHTML = lang(`<p class="text-gray-500">{{please_enter_a_search}}</p>`);
		return;
	}

	try {
		const response = await fetch(`/auth/users/search?q=${encodeURIComponent(searchQuery)}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const users = await response.json();

			if (users.length === 0) {
				resultsContainer.innerHTML = lang(`<p class="text-gray-500">{{no_users_found}}</p>`);
			} else {
				resultsContainer.innerHTML = users.map(user => lang(`
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
							${user.friendStatus === 'none' ? '{{add_friend}}' : ''}
							${user.friendStatus === 'pending' ? '{{friend_request_sent}}' : ''}
							${user.friendStatus === 'friends' ? '{{friends}}' : ''}
						</button>
					</div>
				`)).join('');

				document.querySelectorAll('.send-request').forEach(button => {
					if (button.getAttribute('disabled') !== 'disabled') {
						button.addEventListener('click', async () => {
							const userId = button.getAttribute('data-id');
							await sendFriendRequest(userId);
							button.textContent = lang('{{friend_request_sent}}');
							button.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
							button.classList.add('bg-yellow-600', 'hover:bg-yellow-700');
							button.setAttribute('disabled', 'disabled');
						});
					}
				});
			}
		} else {
			resultsContainer.innerHTML = lang(`<p class="text-red-500">{{error_searching_users}}</p>`);
		}
	} catch (err) {
		console.error('Error searching users:', err);
		resultsContainer.innerHTML = lang(`<p class="text-red-500">{{error_searching_users}}</p>`);
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
			alert(lang('{{friend_request_fail}}'));
		}
	} catch (err) {
		console.error('Error sending friend request:', err);
		alert(lang('{{friend_request_fail}}'));
	}
}