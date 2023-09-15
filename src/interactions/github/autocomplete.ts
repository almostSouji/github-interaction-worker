import { GITHUB_BASE_URL } from '../../Constants.js';
import type { GitHubAPISearchResult } from '../../interfaces/GitHub.js';
import { autocompleteRespond } from '../../utils/respond.js';
import { truncateWord, truncate } from '../../utils/util.js';

declare let GITHUB_TOKEN: string;
function buildQuery(owner: string, repository: string, expression: string) {
	return `
	{
		search(query: "${expression} repo:${owner}/${repository} sort:created-desc", type: ISSUE, last: 25) {
			edges {
				node {
					... on PullRequest {
						number
						title
						url
						author {
							login
						}
				}
					... on Issue {
						title
						url
						number
						author {
							login
						}
					}
				}
			}
		}
	}`;
}

export async function githubIssueAutocomplete(
	owner: string,
	repository: string,
	expression: string,
): Promise<Response> {
	try {
		const query = buildQuery(owner, repository, expression);

		const res: GitHubAPISearchResult = await fetch(GITHUB_BASE_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${GITHUB_TOKEN}`, // eslint-disable-line @typescript-eslint/naming-convention
				'User-Agent': 'CF Worker', // eslint-disable-line @typescript-eslint/naming-convention
			},
			body: JSON.stringify({ query }),
		}).then(async (res) => res.json());

		if (!res.data) {
			return autocompleteRespond([]);
		}

		const commits = res.data.search.edges;
		return autocompleteRespond(
			commits.map(({ node: { number, title, url, author } }) => ({
				name: `${truncate(title, 65)} #${number} by ${truncateWord(author.login, 20)}`,
				value: url,
			})),
		);
	} catch (error) {
		console.log(error);
		return autocompleteRespond([]);
	}
}
