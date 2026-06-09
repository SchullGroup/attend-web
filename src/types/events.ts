import { ApiResponse } from "./api";

export interface EventListItem {
  id: string;
  title: string;
  eventType: string;
  format: string;
  status: string;
  date: string;
  startTime: string;
  venue: string;
  streamUrl: string;
  organizerName: string;
  organizerLogo: string;
  maximumCapacity: number;
  rsvpEnabled?: boolean;
  registered: boolean;
}

export interface EventDetail {
  id: string;
  title: string;
  description: string;
  eventType: string;
  format: string;
  status: string;
  date: string;
  startTime: string;
  venue: string;
  streamUrl: string;
  organizerName: string;
  organizerLogo: string;
  organizerPrimaryColor: string;
  maximumCapacity: number;
  registeredCount: number;
  registered: boolean;
  agmProxyEnabled: boolean;
}

export interface EventsListData {
  totalCount: number;
  page: number;
  size: number;
  events: EventListItem[];
}

export interface EventsQueryParams {
  search?: string;
  eventType?: string;
  status?: string;
  page?: number;
  size?: number;
}

export type EventsListResponse = ApiResponse<EventsListData>;
export type EventDetailResponse = ApiResponse<EventDetail>;
