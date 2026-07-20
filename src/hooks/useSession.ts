import Cookies from "js-cookie";
import { useGetMe } from "@/api/auth/hooks";
import { useGetGuestSession } from "@/api/guests/hooks";

export interface Session {
  type: "SHAREHOLDER" | "GUEST" | "ANONYMOUS";
  user: {
    id: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    capabilities: ("VIEW" | "QA" | "VOTE")[];
  } | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useSession(): Session {
  const isGuest = Cookies.get("isGuest") === "true";
  const hasToken = !!Cookies.get("accessToken");

  // Only call getMe if not a guest and token is present
  const { data: userResp, isLoading: userLoading } = useGetMe(!isGuest && hasToken);
  // Only call guest session if is guest and token is present
  const { data: guestResp, isLoading: guestLoading } = useGetGuestSession(isGuest && hasToken);

  if (!hasToken) {
    return {
      type: "ANONYMOUS",
      user: null,
      loading: false,
      isAuthenticated: false,
    };
  }

  if (isGuest) {
    const session = guestResp?.data;
    return {
      type: "GUEST",
      user: session ? {
        id: session.id,
        fullName: session.fullName,
        email: session.email,
        phone: session.phone,
        role: session.role,
        capabilities: session.capabilities || [],
      } : null,
      loading: guestLoading,
      isAuthenticated: !!session,
    };
  }

  const user = userResp?.data;
  return {
    type: "SHAREHOLDER",
    user: user ? {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phoneNumber,
      role: "Shareholder",
      capabilities: ["VIEW", "QA", "VOTE"],
    } : null,
    loading: userLoading,
    isAuthenticated: !!user,
  };
}
