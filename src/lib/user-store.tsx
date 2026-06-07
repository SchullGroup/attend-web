"use client";
import { createContext, useContext, useState } from "react";
import { KYCStatus } from "./mock-data";
import { KycStatusValue } from "@/types";

export function mapKycStatus(apiStatus: KycStatusValue | string): KYCStatus {
  switch (apiStatus) {
    case "FULL_KYC":
      return "full";
    case "BASIC_KYC":
      return "basic";
    case "PENDING":
      return "pending";
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
