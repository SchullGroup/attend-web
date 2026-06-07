import { ApiResponse } from "./api";
import { EventListItem } from "./events";

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  repositoryUrl: string;
  demoUrl: string;
  status: string;
}

export interface TeamData {
  id: string;
  name: string;
  description: string;
  eventId: string;
  leader: TeamMember;
  members: TeamMember[];
  submission: Submission | null;
}

export interface ChallengesListData {
  totalCount: number;
  page: number;
  size: number;
  events: EventListItem[];
}

export interface CreateTeamRequest {
  name: string;
  description: string;
}

export interface SubmitProjectRequest {
  title: string;
  description: string;
  repositoryUrl: string;
  demoUrl: string;
}

export type TeamResponse = ApiResponse<TeamData>;
export type ChallengesListResponse = ApiResponse<ChallengesListData>;
