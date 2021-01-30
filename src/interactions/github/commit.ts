import { DateTime } from 'luxon';
import { DATE_FORMAT_WITHOUT_SECONDS, GITHUB_BASE_URL, GITHUB_EMOJI_COMMIT, FAIL_PREFIX } from '../../Constants';
import { GitHubAPIResult } from '../../interfaces/GitHub';

declare let GITHUB_TOKEN: string;
function buildQuery(owner: string, repository: string, expression: string) {
	return `
		{
			repository(owner: "${owner}", name: "${repository}") {
				object(expression: "${expression}") {
					... on Commit {
						messageHeadline
						abbreviatedOid
						changedFiles
						commitUrl
						pushedDate
						author {
							avatarUrl
							name
							user {
								login
								avatarUrl
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
				'Authorization': `Bearer ${GITHUB_TOKEN}`, // eslint-disable-line @typescript-eslint/naming-convention
				'User-Agent': 'CF Worker' // eslint-disable-line @typescript-eslint/naming-convention
			},
			body: JSON.stringify({ query })
		}).then(res => res.json());

		if (!res.data) {
			return new Response(JSON.stringify({
				data: {
					content: `${FAIL_PREFIX} GitHub fetching unsuccessful. Arguments: \`owner: ${owner}\`, \`repository: ${repository}\`, \`expression: ${expression}\``,
					flags: 64
				},
				type: 3
			}));
		}

		if (res.errors?.some(e => e.type === 'NOT_FOUND') || !res.data.repository?.object) {
			return new Response(JSON.stringify({
				data: {
					content: `${FAIL_PREFIX} Could not find commit \`${expression}\` on the repository \`${owner}/${repository}\`.`,
					flags: 64
				},
				type: 3
			}));
		}

		const commit = res.data.repository.object;
		return new Response(JSON.stringify({
			data: {
				content: `${GITHUB_EMOJI_COMMIT} [\`${commit.abbreviatedOid}\`](<${commit.commitUrl ?? ''}>) ${commit.pushedDate ? `at \`${DateTime.fromMillis(new Date(commit.pushedDate).getTime()).toFormat(DATE_FORMAT_WITHOUT_SECONDS)}\`` : ''} *by [${commit.author.user?.login ?? commit.author.name ?? ''}](<${commit.author.user?.url ?? ''}>)* \n${commit.messageHeadline ?? ''}`
			},
			type: 4
		}));
	} catch (error) {
		return new Response(JSON.stringify({
			data: {
				content: `${FAIL_PREFIX} Something went wrong :( Arguments: \`owner: ${owner}\`, \`repository: ${repository}\`, \`expression: ${expression}\``,
				flags: 64
			},
			type: 3
		}));
	}
}
