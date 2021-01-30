import { verifyKey } from 'discord-interactions';
import { githubInfo } from './interactions/github/github';

declare let DISCORD_CLIENT_SECRET: string;

async function isValidRequest(request: Request): Promise<boolean> {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	if (!signature || !timestamp || !request.body) {
		return false;
	}
	const rawBody = await request.clone().arrayBuffer();
	return verifyKey(rawBody, signature, timestamp, DISCORD_CLIENT_SECRET);
}

export async function handleRequest(request: Request): Promise<Response> {
	try {
		if (!await isValidRequest(request)) return new Response('Bad request signature', { status: 401 });

		const body = await request.clone().json();
		const { data: { name, options } } = body;

		if (body.type === 2) {
			if (options?.length) {
				const args = Object.fromEntries(options.map(({ name, value }: { name: string; value: any }) => [name, value]));

				if (name === 'github') {
					return githubInfo(args.owner ?? 'discordjs', args.repository ?? 'discord.js', args.query);
				}
			}
		}

		return ack();
	} catch (err) {
		return ack();
	}
}

function ack() {
	return new Response(JSON.stringify({
		type: 1
	}), { status: 200 });
}
