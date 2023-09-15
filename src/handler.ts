import { InteractionType } from 'discord-api-types/v10';
import { PlatformAlgorithm, isValidRequest } from 'discord-verify';
import { githubIssueAutocomplete } from './interactions/github/autocomplete.js';
import { githubInfo } from './interactions/github/github.js';
import { ack } from './utils/respond.js';

declare let DISCORD_CLIENT_SECRET: string;
declare let DEFAULT_REPO_OWNER: string;
declare let DEFAULT_REPO: string;

export async function handleRequest(request: Request): Promise<Response> {
	try {
		if (!(await isValidRequest(request, DISCORD_CLIENT_SECRET, PlatformAlgorithm.Cloudflare))) {
			return new Response('Bad request signature', { status: 401 });
		}

		const body = (await request.clone().json()) as any;
		const {
			data: { name, options },
		} = body;
		if (body.type === InteractionType.ApplicationCommandAutocomplete && options?.length) {
			const args = Object.fromEntries(options.map(({ name, value }: { name: string; value: any }) => [name, value]));

			if (name === 'github') {
				return await githubIssueAutocomplete(
					args.owner ?? DEFAULT_REPO_OWNER,
					args.repository ?? DEFAULT_REPO,
					args.query,
				);
			}
		}

		if (body.type === InteractionType.ApplicationCommand && options?.length) {
			const args = Object.fromEntries(options.map(({ name, value }: { name: string; value: any }) => [name, value]));

			if (name === 'github') {
				return await githubInfo(args.owner ?? DEFAULT_REPO_OWNER, args.repository ?? DEFAULT_REPO, args.query);
			}
		}

		return ack();
	} catch {
		return ack();
	}
}
