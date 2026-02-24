import { createClient } from 'redis';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_USER } from '@config/env-config';

const client = createClient({
	url: `redis://${REDIS_HOST}:${Number(REDIS_PORT)}`,
	username: REDIS_USER,
	password: REDIS_PASSWORD,
});

client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();

await client.set('key', 'value');
const value = await client.get('key');
console.log(value); // >>> value

await client.hSet('user-session:123', {
	name: 'John',
	surname: 'Smith',
	company: 'Redis',
	age: 29,
});

let userSession = await client.hGetAll('user-session:123');
console.log(JSON.stringify(userSession, null, 2));
/* >>>
{
  "surname": "Smith",
  "name": "John",
  "company": "Redis",
  "age": "29"
}
 */

await client.quit();