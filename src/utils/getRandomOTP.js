import { randomInt } from 'node:crypto';

export function getRandomOTP() {
	const randNum = randomInt(1, 999999);
	return randNum.toString().padStart(6, '0')
};