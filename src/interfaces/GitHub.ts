/* eslint-disable @typescript-eslint/naming-convention */

export type GitHubUser = {
	login: string;
	url: string;
}

export type GitHubUserWithoutURL = {
	login: string;
}

export type GitActor = {
	name?: string;
	user?: GitHubUser;
}

export type GitHubCommit = {
	abbreviatedOid: string;
	author: GitActor;
	commitUrl?: string;
	messageHeadline?: string;
	pushedDate?: string;
	repository: { nameWithOwner: string };
}

export enum GitHubReviewState {
	APPROVED = 'APPROVED',
	CHANGES_REQUESTED = 'CHANGES_REQUESTED',
	COMMENTED = 'COMMENTED',
	DISMISSED = 'DISMISSED',
	PENDING = 'PENDING'
}

export type GitHubReview = {
	author: GitHubUser;
	state: GitHubReviewState;
	url: string;
}

export type GitHubIssue = {
	author: GitHubUser;
	closed: boolean;
	closedAt: string | null;
	number: number;
	publishedAt: string;
	repository: { nameWithOwner: string };
	title: string;
	url: string;
}

export enum GitHubReviewDecision {
	APPROVED = 'APPROVED',
	CHANGES_REQUESTED = 'CHANGES_REQUESTED',
	REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

export type GitHubPRData = {
	commits: { nodes: GitHubCommit[] };
	headRef: { name: string } | null;
	headRepository: { nameWithOwner: string };
	isDraft: boolean;
	mergeCommit: GitHubCommit | null;
	merged: boolean;
	mergedAt: string | null;
	reviewDecision: GitHubReviewDecision | null;
}

export type GitHubPR = GitHubIssue & GitHubPRData;

export type GitHubAPIErrorData = {
	locations: string[];
	message: string;
	path: string[];
	type: string;
}

export type GitHubAPIData = {
	repository?: {
		issueOrPullRequest?: GitHubIssue | GitHubPR | null;
		object: GitHubCommit;
	};
}

export type GitHubAPIResult = {
	data?: GitHubAPIData;
	errors?: GitHubAPIErrorData[];
}

export type GitHubSearchIssueOrPR = {
	node: {
		author: GitHubUserWithoutURL;
		number: number;
		title: string;
		url: string;
	};
}

export type GitHubAPSearchIData = {
	search: {
		edges: GitHubSearchIssueOrPR[];
	};
}

export type GitHubAPISearchResult = {
	data?: GitHubAPSearchIData;
	errors: GitHubAPIErrorData[];
}

export function isPR(issue: GitHubIssue | GitHubPR): issue is GitHubPR {
	return Reflect.has(issue, 'commits');
}
