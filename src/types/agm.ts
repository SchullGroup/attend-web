import { ApiResponse } from "./api";

export type VoteChoiceValue = "FOR" | "AGAINST" | "ABSTAIN";

// One candidate on a candidate/election resolution, with that candidate's own tally.
export interface CandidateItem {
  id: string;
  name: string;
  bio?: string;
  order?: number;
  myVote?: string | null;
  forCount?: number;
  againstCount?: number;
  abstainCount?: number;
  forShares?: number;
  againstShares?: number;
  abstainShares?: number;
}

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
  // Candidate ("election") resolutions carry a list of candidates; each is voted on
  // independently. The API calls these `candidates` (the spec's "nominees" naming
  // was never shipped). A standard resolution has an empty/absent list.
  resolutionType?: string; // STANDARD | CANDIDATE
  candidates?: CandidateItem[];
  bySource?: {
    ONLINE?: {
      for: number;
      against: number;
      abstain: number;
      forShares?: number;
      againstShares?: number;
      abstainShares?: number;
    };
    IN_ROOM?: {
      for: number;
      against: number;
      abstain: number;
      forShares?: number;
      againstShares?: number;
      abstainShares?: number;
    };
    PROXY?: {
      for: number;
      against: number;
      abstain: number;
      forShares?: number;
      againstShares?: number;
      abstainShares?: number;
    };
  };
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

// Standard resolution → send `choice`.
// Candidate resolution → send `votes`, with one entry per candidate. The backend
// rejects a bare `choice` on a candidate resolution ("Votes required").
export interface CastVoteRequest {
  choice?: VoteChoiceValue;
  votes?: {
    candidateId: string;
    choice: VoteChoiceValue;
  }[];
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
  status?: string; // PENDING | ACCEPTED | ATTENDED
  sharesRepresented?: number;
  directions?: {
    resolutionId: string;
    resolutionTitle?: string;
    direction: "FOR" | "AGAINST" | "ABSTAIN" | "LET_PROXY_DECIDE";
    castOutcome?: string;
  }[];
}

export interface ProxyHistoryData {
  proxies: ProxyHistoryItem[];
}

export type ResolutionsResponse = ApiResponse<ResolutionsData>;
// The guest endpoint returns a bare array of the same items — no votingOpen / hasProxy /
// shareWeightedTalliesEnabled wrapper, since none of those apply to a view-only guest.
export type GuestResolutionsResponse = ApiResponse<Resolution[]>;
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
