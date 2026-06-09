import { NavShell } from "@/components/attend/NavShell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <NavShell>{children}</NavShell>;
}
