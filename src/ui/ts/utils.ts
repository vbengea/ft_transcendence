
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

export function validatePassword(password) {

	const validations = [
		{ test: password.length >= 6, message: 'Password must be at least 6 characters' },
		{ test: /[A-Z]/.test(password), message: 'Password must contain at least one uppercase letter' },
		{ test: /[a-z]/.test(password), message: 'Password must contain at least one lowercase letter' },
		{ test: /[0-9]/.test(password), message: 'Password must contain at least one number' },
		{ test: /[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\-]/.test(password), message: 'Password must contain at least one special character' },
		{ test: /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\-]+$/.test(password), message: 'Password can only contain letters, numbers and special characters' }
	];

	for (const validation of validations) {
		if (!validation.test) {
			return { valid: false, message: validation.message };
		}
	}

	return { valid: true, message: '' };
}