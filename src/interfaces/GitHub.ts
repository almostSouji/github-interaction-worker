/* eslint-disable @typescript-eslint/naming-convention */

export interface GitHubUser {
	login: string;
	url: string;
}

export interface GitActor {
	user?: GitHubUser;
	name?: string;
}

export interface GitHubCommit {
	abbreviatedOid: string;
	messageHeadline?: string;
	author: GitActor;
	commitUrl?: string;
	pushedDate?: string;
}

export enum GitHubReviewState {
	PENDING = 'PENDING',
	COMMENTED = 'COMMENTED',
	APPROVED = 'APPROVED',
	CHANGES_REQUESTED = 'CHANGES_REQUESTED',
	DISMISSED = 'DISMISSED',
}

export interface GitHubReview {
	author: GitHubUser;
	state: GitHubReviewState;
	url: string;
}

export interface GitHubIssue {
	author: GitHubUser;
	number: number;
	publishedAt: string;
	title: string;
	url: string;
	closed: boolean;
	closedAt: string | null;
}

export enum GitHubReviewDecision {
	CHANGES_REQUESTED = 'CHANGES_REQUESTED',
	APPROVED = 'APPROVED',
	REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

export interface GitHubPRData {
	commits: { nodes: GitHubCommit[] };
	merged: boolean;
	mergeCommit: GitHubCommit | null;
	headRef: { name: string } | null;
	headRepository: { nameWithOwner: string };
	mergedAt: string | null;
	isDraft: boolean;
	reviewDecision: GitHubReviewDecision | null;
}

export type GitHubPR = GitHubIssue & GitHubPRData;

export interface GitHubAPIErrorData {
	type: string;
	path: string[];
	locations: string[];
	message: string;
}

export interface GitHubAPIData {
	repository?: {
		issueOrPullRequest?: GitHubIssue | GitHubPR | null;
		object: GitHubCommit;
	};
}

export interface GitHubAPIResult {
	errors?: GitHubAPIErrorData[];
	data?: GitHubAPIData;
}

export function isPR(issue: GitHubIssue | GitHubPR): issue is GitHubPR {
	return Reflect.has(issue, 'commits');
}
