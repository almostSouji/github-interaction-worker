import { respondError } from '../../utils/respond.js';
import { commitInfo } from './commit.js';
import { issueInfo } from './issue.js';

function validateGitHubName(name: string): boolean {
	const reg = /[\w.-]+/;
	const match = reg.exec(name);
	return name.length === match?.[0].length;
}

export async function githubInfo(_owner: string, _repository: string, _expression: string): Promise<Response> {
	const re = /(?:https?:\/\/github\.com)?\/?(.*?)\/(.*?)\/.*?\/(.[\dA-Za-z]*)/;
	const res = re.exec(_expression);

	let owner = _owner;
	let repository = _repository;
	let expression = _expression;

	if (res) {
		const [, expressionOwner, expressionRepository, expressionQuery] = res;
		owner = expressionOwner;
		repository = expressionRepository;
		expression = expressionQuery;
	}

	if (!validateGitHubName(owner)) {
		return respondError(`Invalid repository owner name: \`${owner}\`.`);
	}

	if (!validateGitHubName(repository)) {
		return respondError(`Invalid repository name: \`${repository}\`.`);
	}

	if (Number.isNaN(Number(expression))) {
		return commitInfo(owner, repository, expression);
	}

	return issueInfo(owner, repository, expression);
}
