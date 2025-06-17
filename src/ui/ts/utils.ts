
export const fetchOnlineStatus = async (friends) => {
	if (!friends || friends.length === 0) return {};

	const userIds = friends.map(f => f.id).join(',');
	try {
		const response = await fetch(`/api/online-status?ids=${userIds}`);
		if (response.ok) {
			return await response.json();
		}
	} catch (err) {
		console.error('Error fetching online statuses:', err);
	}

	return {};
};
