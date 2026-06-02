"use client";
import { createContext, useContext, useState } from "react";
import { MOCK_USER, KYCStatus } from "./mock-data";

interface UserStore { kycStatus: KYCStatus; setKycStatus: (s: KYCStatus) => void; }
const UserContext = createContext<UserStore>({ kycStatus: MOCK_USER.kycStatus, setKycStatus: () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [kycStatus, setKycStatus] = useState<KYCStatus>(MOCK_USER.kycStatus);
  return <UserContext.Provider value={{ kycStatus, setKycStatus }}>{children}</UserContext.Provider>;
}
export const useUserStore = () => useContext(UserContext);
