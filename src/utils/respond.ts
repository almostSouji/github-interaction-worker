import { FAIL_PREFIX } from '../Constants';

export function respond(content: string, ephemeral = false, mentions: string[] = []) {
	const res = new Response(JSON.stringify(
		{
			data: {
				content,
				flags: ephemeral ? 64 : 0,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				allowed_mentions: { parse: mentions }
			},
			type: 4
		}
	));
	res.headers.set('Content-Type', 'application/json');
	return res;
}

export function respondError(content: string) {
	return respond(`${FAIL_PREFIX} ${content}`, true);
}

export function ack() {
	return new Response(JSON.stringify({
		type: 1
	}), { status: 200 });
}
