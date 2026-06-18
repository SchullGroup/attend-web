"use client";
import { createContext, useContext, useState } from "react";
import { KycStatusValue } from "@/types";

export type KYCStatus = "none" | "basic" | "full" | "pending";

export function mapKycStatus(apiStatus: KycStatusValue | string): KYCStatus {
  switch (apiStatus) {
    case "FULL_KYC":
      return "full";
    case "BASIC_KYC":
      return "basic";
    case "PENDING":
    case "PENDING_REVIEW":
      return "pending";
    // NO_KYC, REJECTED, or anything unknown → treat as not verified
    default:
      return "none";
  }
}

interface UserStore {
  kycStatus: KYCStatus;
  setKycStatus: (s: KYCStatus) => void;
}
const UserContext = createContext<UserStore>({
  kycStatus: "none",
  setKycStatus: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [kycStatus, setKycStatus] = useState<KYCStatus>("none");
  return (
    <UserContext.Provider value={{ kycStatus, setKycStatus }}>
      {children}
    </UserContext.Provider>
  );
}
export const useUserStore = () => useContext(UserContext);
