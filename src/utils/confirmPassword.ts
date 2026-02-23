export function confirmPassword(password: string, confirmed_password: string) {
	if (password == confirmed_password) {
		return true;
	} else {
		return false;
	}
}
