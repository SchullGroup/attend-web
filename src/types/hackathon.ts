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

export interface ChallengeMyTeamSummary {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  submissionStatus: string;
}

export interface ChallengeDetailData {
  id: string;
  title: string;
  description: string;
  eventType: string;
  status: string;
  date: string;
  startTime: string;
  venue: string;
  organizerName: string;
  registered: boolean;
  resourceCount: number;
  myTeam: ChallengeMyTeamSummary | null;
}

export interface ChallengeResource {
  id: string;
  title: string;
  description: string;
  resourceType: string;
  url: string;
  fileType: string;
  sizeBytes: number;
  originalFilename: string;
}

export interface ChallengeCertificateData {
  eventId: string;
  eventTitle: string;
  participantName: string;
  teamName: string;
  applicationStatus: string;
  eligible: boolean;
  message: string;
}

export interface MyTeamItem {
  teamId: string;
  teamName: string;
  eventId: string;
  eventTitle: string;
  eventType: string;
  eventStatus: string;
  eventDate: string;
  leader: boolean;
  memberCount: number;
  submissionStatus: string;
}

export interface MyTeamsData {
  totalCount: number;
  teams: MyTeamItem[];
}

export type ChallengeDetailResponse = ApiResponse<ChallengeDetailData>;
export type ChallengeResourcesResponse = ApiResponse<ChallengeResource[]>;
export type ChallengeCertificateResponse = ApiResponse<ChallengeCertificateData>;
export type MyTeamsResponse = ApiResponse<MyTeamsData>;
