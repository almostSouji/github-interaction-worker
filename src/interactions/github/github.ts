import { respondError } from '../../utils/respond';
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
		return respondError(`Invalid repository owner name: \`${owner}\`.`);
	}

	if (!validateGitHubName(repository)) {
		return respondError(`Invalid repository name: \`${repository}\`.`);
	}

	if (isNaN(Number(expression))) {
		return commitInfo(owner, repository, expression);
	}
	return issueInfo(owner, repository, expression);
}
