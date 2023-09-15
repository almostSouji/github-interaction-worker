import { GITHUB_BASE_URL, GITHUB_EMOJI_COMMIT } from '../../Constants.js';
import type { GitHubAPIResult } from '../../interfaces/GitHub.js';
import { respond, respondError } from '../../utils/respond.js';

declare let GITHUB_TOKEN: string;
function buildQuery(owner: string, repository: string, expression: string) {
	return `
		{
			repository(owner: "${owner}", name: "${repository}") {
				object(expression: "${expression}") {
					... on Commit {
						repository {
							nameWithOwner
						}
						messageHeadline
						abbreviatedOid
						commitUrl
						pushedDate
						author {
							name
							user {
								login
								url
							}
						}
					}
				}
			}
		}`;
}

export async function commitInfo(owner: string, repository: string, expression: string): Promise<Response> {
	try {
		const query = buildQuery(owner, repository, expression);

		const res: GitHubAPIResult = await fetch(GITHUB_BASE_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${GITHUB_TOKEN}`, // eslint-disable-line @typescript-eslint/naming-convention
				'User-Agent': 'CF Worker', // eslint-disable-line @typescript-eslint/naming-convention
			},
			body: JSON.stringify({ query }),
		}).then(async (res) => res.json());

		if (!res.data) {
			return respondError(
				`GitHub fetching unsuccessful. Arguments: \`owner: ${owner}\`, \`repository: ${repository}\`, \`expression: ${expression}\``,
			);
		}

		if (res.errors?.some((errorData) => errorData.type === 'NOT_FOUND') || !res.data.repository?.object) {
			return respondError(`Could not find commit \`${expression}\` on the repository \`${owner}/${repository}\`.`);
		}

		const commit = res.data.repository.object;
		return respond(
			`${GITHUB_EMOJI_COMMIT} [${commit.abbreviatedOid} in ${commit.repository.nameWithOwner}](<${
				commit.commitUrl ?? ''
			}>) by [${commit.author.user?.login ?? commit.author.name ?? ''}](<${commit.author.user?.url ?? ''}>) ${
				commit.pushedDate ? `committed <t:${Math.floor(new Date(commit.pushedDate).getTime() / 1_000)}:R>` : ''
			} \n${commit.messageHeadline ?? ''}`,
		);
	} catch {
		return respondError(
			`Something went wrong :( Arguments: \`owner: ${owner}\`, \`repository: ${repository}\`, \`expression: ${expression}\``,
		);
	}
}
