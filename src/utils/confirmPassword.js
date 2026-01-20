export function confirmPassword(password, confirmed_password) {
	if (password == confirmed_password) {
		return true;
	} else {
		return false;
	}
}