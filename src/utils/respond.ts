import type { APIApplicationCommandOptionChoice} from 'discord-api-types/v10';
import { InteractionResponseType } from 'discord-api-types/v10';
import { FAIL_PREFIX } from '../Constants.js';

export function respond(content: string, ephemeral = false, mentions: string[] = []) {
	const res = new Response(
		JSON.stringify({
			data: {
				content,
				flags: ephemeral ? (1 << 2) | (1 << 6) : 1 << 2,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				allowed_mentions: { parse: mentions },
			},
			type: InteractionResponseType.ChannelMessageWithSource,
		}),
	);
	res.headers.set('Content-Type', 'application/json');
	return res;
}

export function respondError(content: string) {
	return respond(`${FAIL_PREFIX} ${content}`, true);
}

export function ack() {
	return new Response(
		JSON.stringify({
			type: 1,
		}),
		{ status: 200 },
	);
}

export function autocompleteRespond(choices: APIApplicationCommandOptionChoice[]) {
	const res = new Response(
		JSON.stringify({
			data: {
				choices,
			},
			type: InteractionResponseType.ApplicationCommandAutocompleteResult,
		}),
	);
	res.headers.set('Content-Type', 'application/json');
	return res;
}
