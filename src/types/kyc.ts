import { ApiResponse } from "./api";

export type KycStatusValue = "NONE" | "BASIC_KYC" | "FULL_KYC" | "PENDING";

export interface KycStatusData {
  kycStatus: KycStatusValue;
  submittedAt?: string;
  bvnVerified?: boolean;
  ninVerified?: boolean;
  chnVerified?: boolean;
}

// Stepped KYC flow (backend split the old single submit into steps).
export interface KycStep1Request {
  bvn: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
}

export interface KycStep2Request {
  chn: string;
}

export interface KycStep3Request {
  selfieImage: string;
  bvn: string;
}

export type KycStatusResponse = ApiResponse<KycStatusData>;
