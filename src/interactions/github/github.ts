import { FAIL_PREFIX } from '../../Constants';
import { commitInfo } from './commit';
import { issueInfo } from './issue';

function validateGitHubName(name: string): boolean {
	const reg = /[A-Za-z0-9_.-]+/;
	const match = reg.exec(name);
	return name.length === match?.[0].length;
}

export async function githubInfo(owner: string, repository: string, expression: string): Promise<Response> {
	const re = /(?:https?:\/\/github\.com)?\/?(.*?)\/(.*?)\/.*?\/(.[a-zA-Z0-9]*)/;
	const res = re.exec(expression);
	if (res) {
		const [, o, r, q] = res;
		owner = o;
		repository = r;
		expression = q;
	}
	if (!validateGitHubName(owner)) {
		return new Response(JSON.stringify({
			data: {
				content: `${FAIL_PREFIX} Invalid repository owner name: \`${owner}\`.`,
				flags: 64,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				allowed_mentions: { parse: [] }
			},
			type: 3
		}));
	}

	if (!validateGitHubName(repository)) {
		return new Response(JSON.stringify({
			data: {
				content: `${FAIL_PREFIX} Invalid repository name: \`${repository}\`.`,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				allowed_mentions: { parse: [] },
				flags: 64
			},
			type: 3
		}));
	}

	if (isNaN(Number(expression))) {
		return commitInfo(owner, repository, expression);
	}
	return issueInfo(owner, repository, expression);
}
