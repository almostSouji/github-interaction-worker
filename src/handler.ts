import { verifyKey } from 'discord-interactions';
import { githubInfo } from './interactions/github/github';
import { ack } from './utils/respond';
import { InteractionType } from 'discord-api-types/v10';
import { githubIssueAutocomplete } from './interactions/github/autocomplete';

declare let DISCORD_CLIENT_SECRET: string;
declare let DEFAULT_REPO_OWNER: string;
declare let DEFAULT_REPO: string;

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
		if (body.type === InteractionType.ApplicationCommandAutocomplete) {
			if (options?.length) {
				const args = Object.fromEntries(options.map(({ name, value }: { name: string; value: any }) => [name, value]));

				if (name === 'github') {
					return githubIssueAutocomplete(args.owner ?? DEFAULT_REPO_OWNER, args.repository ?? DEFAULT_REPO, args.query);
				}
			}
		}

		if (body.type === InteractionType.ApplicationCommand) {
			if (options?.length) {
				const args = Object.fromEntries(options.map(({ name, value }: { name: string; value: any }) => [name, value]));

				if (name === 'github') {
					return githubInfo(args.owner ?? DEFAULT_REPO_OWNER, args.repository ?? DEFAULT_REPO, args.query);
				}
			}
		}

		return ack();
	} catch (err) {
		return ack();
	}
}
