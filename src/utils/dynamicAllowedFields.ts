export const allowedFieldsFunc = async (allowedArr: Array<string>, reqBody: object) => {
	const updateFields = {};
	allowedArr.forEach((element) => {
		if (Object.hasOwnProperty.call(reqBody, element)) {
			if (reqBody[element] !== '' && reqBody[element] !== null) {
				updateFields[element] = reqBody[element];
			}
		}
	});
	return updateFields;
};
