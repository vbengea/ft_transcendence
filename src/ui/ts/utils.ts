import { lang } from './events';

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
		{ test: password.length >= 6, message: '{{password_min_6_chars}}' },
		{ test: /[A-Z]/.test(password), message: '{{password_need_uppercase}}' },
		{ test: /[a-z]/.test(password), message: '{{password_need_lowercase}}' },
		{ test: /[0-9]/.test(password), message: '{{password_need_number}}' },
		{ test: /[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\-]/.test(password), message: '{{password_need_special}}' },
		{ test: /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\-]+$/.test(password), message: '{{password_only_allowed_chars}}' }
	];

	for (const validation of validations) {
		if (!validation.test) {
			return { valid: false, message: lang(validation.message) };
		}
	}

	return { valid: true, message: '' };
}