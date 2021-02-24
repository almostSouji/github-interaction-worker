
import { DateTime } from 'luxon';
import { DATE_FORMAT_WITHOUT_SECONDS, GITHUB_BASE_URL, GITHUB_EMOJI_ISSUE_CLOSED, GITHUB_EMOJI_ISSUE_OPEN, GITHUB_EMOJI_PR_CLOSED, GITHUB_EMOJI_PR_DRAFT, GITHUB_EMOJI_PR_MERGED, GITHUB_EMOJI_PR_OPEN, FAIL_PREFIX } from '../../Constants';
import { GitHubAPIResult, GitHubReviewDecision, isPR } from '../../interfaces/GitHub';

declare let GITHUB_TOKEN: string;

/* eslint-disable @typescript-eslint/naming-convention */

enum ResultStatePR {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
	MERGED = 'MERGED',
	DRAFT = 'DRAFT',
}

enum ResultStateIssue {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
}

enum InstallableState {
	OPEN = 'OPEN',
	DRAFT = 'DRAFT',
}

const Timestamps = {
	OPEN: 'publishedAt',
	CLOSED: 'closedAt',
	MERGED: 'mergedAt',
	DRAFT: 'publishedAt'
} as const;

/* eslint-enable @typescript-eslint/naming-convention */

type TimestampsWithoutMerged = Omit<typeof Timestamps, 'MERGED'>;

type TimestampsWithoutMergedKey = TimestampsWithoutMerged[keyof TimestampsWithoutMerged];

function buildQuery(owner: string, repository: string, issueID: string) {
	return `
		{
			repository(owner: "${owner}", name: "${repository}") {
				issueOrPullRequest(number: ${issueID}) {
					... on PullRequest {
						commits(last: 1) {
							nodes {
								commit {
									abbreviatedOid
								}
							}
						}
						author {
							login
							url
						}
						merged
						headRef {
							name
						}
						headRepository {
							nameWithOwner
						}
						mergedAt
						isDraft
						number
						publishedAt
						title
						url
						closed
						closedAt
						reviewDecision
					}
					... on Issue {
						author {
							login
							url
						}
						number
						publishedAt
						title
						url
						closed
						closedAt
					}
				}
			}
		}`;
}

export async function issueInfo(owner: string, repository: string, expression: string): Promise<Response> {
	try {
		const query = buildQuery(owner, repository, expression);

		const res: GitHubAPIResult = await fetch(GITHUB_BASE_URL, {
			method: 'POST',
			headers: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'Authorization': `Bearer ${GITHUB_TOKEN}`,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'User-Agent': 'CF Worker'
			},
			body: JSON.stringify({ query })
		}).then(res => res.json());

		if (!res.data) {
			return new Response(JSON.stringify({
				data: {
					content: `${FAIL_PREFIX} GitHub fetching unsuccessful.\nArguments: \`owner: ${owner}\`, \`repository: ${repository}\`, \`expression: ${expression}\``,
					flags: 64,
					// eslint-disable-next-line @typescript-eslint/naming-convention
					allowed_mentions: { parse: [] }
				},
				type: 3
			}));
		}

		const issue = res.data.repository?.issueOrPullRequest;
		if (res.errors?.some(e => e.type === 'NOT_FOUND') || !issue) {
			return new Response(JSON.stringify({
				data: {
					content: `${FAIL_PREFIX} Could not find issue or PR \`#${expression}\` on the repository \`${owner}/${repository}\`.`,
					// eslint-disable-next-line @typescript-eslint/naming-convention
					allowed_mentions: { parse: [] },
					flags: 64
				},
				type: 3
			}));
		}

		const resultState = isPR(issue)
			? issue.merged
				? ResultStatePR.MERGED
				: issue.isDraft
					? ResultStatePR.DRAFT
					: issue.closed
						? ResultStatePR.CLOSED
						: ResultStatePR.OPEN
			: issue.closed
				? ResultStateIssue.CLOSED
				: ResultStateIssue.OPEN;

		const emoji = isPR(issue)
			? resultState === ResultStatePR['OPEN']
				? GITHUB_EMOJI_PR_OPEN
				: resultState === ResultStatePR['CLOSED']
					? GITHUB_EMOJI_PR_CLOSED
					: resultState === ResultStatePR['MERGED']
						? GITHUB_EMOJI_PR_MERGED
						: GITHUB_EMOJI_PR_DRAFT
			: resultState === ResultStateIssue['OPEN']
				? GITHUB_EMOJI_ISSUE_OPEN
				: GITHUB_EMOJI_ISSUE_CLOSED;

		const timestampProperty = Timestamps[resultState];
		const timestampState = isPR(issue)
			? resultState === ResultStatePR['OPEN']
				? 'opened'
				: resultState === ResultStatePR['CLOSED']
					? 'closed'
					: resultState === ResultStatePR['MERGED']
						? 'merged'
						: 'created'
			: resultState === ResultStateIssue['OPEN']
				? 'opened'
				: 'closed';

		const relevantTime = DateTime.fromMillis(new Date(isPR(issue) ? issue[timestampProperty]! : issue[timestampProperty as TimestampsWithoutMergedKey]!).getTime());

		const decision = isPR(issue) && !issue.merged && !issue.closed
			? issue.reviewDecision === GitHubReviewDecision['CHANGES_REQUESTED']
				? '**(changes requested)**'
				: issue.reviewDecision === GitHubReviewDecision['APPROVED']
					? '**(approved)**'
					: '**(review required)**'
			: '';

		const parts = [`> ${emoji} [\`#${issue.number}\`](<${issue.url}>) *by [${issue.author.login}](<${issue.author.url}>)* ${timestampState} at \`${relevantTime.toFormat(DATE_FORMAT_WITHOUT_SECONDS)}\` ${isPR(issue) ? decision : ''}`];
		const installable = Reflect.has(InstallableState, resultState);

		parts.push(`> ${issue.title}`);

		if (isPR(issue) && installable) {
			parts.push(`\`📥\` \`npm i ${issue.headRepository.nameWithOwner}#${issue.headRef?.name ?? 'unknown'}\``);
		}

		return new Response(JSON.stringify({
			data: {
				content: parts.join('\n'),
				// eslint-disable-next-line @typescript-eslint/naming-convention
				allowed_mentions: { parse: [] }
			},
			type: 4
		}));
	} catch (error) {
		return new Response(JSON.stringify({
			data: {
				content: `${FAIL_PREFIX} Unable to fetch GitHub information, try again later!`,
				flags: 64,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				allowed_mentions: { parse: [] }
			},
			type: 3
		}));
	}
}
