import fs from 'node:fs/promises';

export async function readTextFile(filePath: string) {
	try {
		const data = await fs.readFile(filePath, { encoding: 'utf8' });
		return data;
	} catch (err) {
		console.error(err);
		throw new Error("Error reading file", {cause: err});
	}
}
