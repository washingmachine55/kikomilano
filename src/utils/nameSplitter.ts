export const nameSplitter = async (nameField: string) => {
	const usernameArray = nameField.split(' ');
	const filteredUsernameArray = usernameArray.filter((word) => word.length >= 1);

	const firstName = filteredUsernameArray[0];
	const lastName = filteredUsernameArray[filteredUsernameArray.length - 1];

	return [firstName, lastName];
};
