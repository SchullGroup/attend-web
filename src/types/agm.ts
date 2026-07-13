import { ApiResponse } from "./api";

export interface Resolution {
  id: string;
  order: number;
  title: string;
  description: string;
  specialResolution: boolean;
  status: string; // WAITING | OPEN | CLOSED
  myVote: string | null;
  votingDeadline: string | null;
  secondsRemaining: number;
  defaultDurationSeconds?: number;
  forCount: number;
  againstCount: number;
  abstainCount: number;
  forShares: number;
  againstShares: number;
  abstainShares: number;
}

export interface ResolutionsData {
  eventId: string;
  votingOpen: boolean;
  earlyVotingOpen?: boolean;
  hasProxy: boolean;
  // When false, the *Shares fields are all 0 — show head counts only, hide shares.
  shareWeightedTalliesEnabled?: boolean;
  resolutions: Resolution[];
}

export interface ProxyData {
  id: string;
  eventId: string;
  proxyName: string;
  proxyEmail: string;
  proxyPhone: string;
  assignedAt: string;
}

export interface AssignProxyRequest {
  proxyName: string;
  proxyEmail: string;
  proxyPhone: string;
}

export interface CastVoteRequest {
  choice: "FOR" | "AGAINST" | "ABSTAIN";
}

export interface ProxyHistoryItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventStatus: string;
  proxyName: string;
  proxyEmail: string;
  proxyPhone: string;
  assignedAt: string;
}

export interface ProxyHistoryData {
  proxies: ProxyHistoryItem[];
}

export type ResolutionsResponse = ApiResponse<ResolutionsData>;
export type ProxyResponse = ApiResponse<ProxyData>;
export type ProxyHistoryResponse = ApiResponse<ProxyHistoryData>;

// AGM minutes. The backend returns `data: null` (with status true) until the client
// admin has finalised them — that's "not published yet", not an error.
export interface MinutesData {
  eventId: string;
  content: string;
  finalisedAt: string;
}

export type MinutesResponse = ApiResponse<MinutesData | null>;

export interface VoteReceiptItem {
  resolutionId: string;
  resolutionTitle: string;
  choice: string;
  votedAt: string;
}

export interface VoteReceiptData {
  eventId: string;
  eventTitle: string;
  totalVotes: number;
  votes: VoteReceiptItem[];
}

export interface EventQuestion {
  id: string;
  content: string;
  askerName: string;
  status: string;
  answer: string;
  answeredBy: string;
  answeredAt: string;
  anonymous: boolean;
  submittedAt: string;
  upvoteCount: number;
  myUpvote: boolean;
}

export interface QuestionsData {
  eventId: string;
  totalCount: number;
  questions: EventQuestion[];
}

export interface SubmitQuestionRequest {
  content: string;
  anonymous: boolean;
}

export type VoteReceiptResponse = ApiResponse<VoteReceiptData>;
export type QuestionsResponse = ApiResponse<QuestionsData>;
