import fs from 'node:fs/promises';

export async function readTextFile(filePath) {
	try {
		const data = await fs.readFile(filePath, { encoding: 'utf8' });
		return data;
	} catch (err) {
		console.error(err);
	}
}
