"use client";
import { createContext, useContext, useState } from "react";
import { KYCStatus } from "./mock-data";

interface UserStore {
  kycStatus: KYCStatus;
  setKycStatus: (s: KYCStatus) => void;
}
const UserContext = createContext<UserStore>({
  kycStatus: "full",
  setKycStatus: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [kycStatus, setKycStatus] = useState<KYCStatus>("full");
  return (
    <UserContext.Provider value={{ kycStatus, setKycStatus }}>
      {children}
    </UserContext.Provider>
  );
}
export const useUserStore = () => useContext(UserContext);
