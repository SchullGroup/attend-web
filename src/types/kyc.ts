import { ApiResponse } from "./api";

export type KycStatusValue = "NONE" | "BASIC_KYC" | "FULL_KYC" | "PENDING";

export interface KycStatusData {
  kycStatus: KycStatusValue;
  submittedAt?: string;
  bvnVerified?: boolean;
  ninVerified?: boolean;
  chnVerified?: boolean;
}

export interface KycSubmitRequest {
  bvn: string;
  nin: string;
  chn: string;
}

export type KycStatusResponse = ApiResponse<KycStatusData>;
