import { ApiResponse } from "./api";

export interface Resolution {
  id: string;
  order: number;
  title: string;
  description: string;
  specialResolution: boolean;
  myVote: string | null;
  forCount: number;
  againstCount: number;
  abstainCount: number;
}

export interface ResolutionsData {
  eventId: string;
  votingOpen: boolean;
  hasProxy: boolean;
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

export type ResolutionsResponse = ApiResponse<ResolutionsData>;
export type ProxyResponse = ApiResponse<ProxyData>;
