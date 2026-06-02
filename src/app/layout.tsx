import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/user-store";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Attend — Enterprise Events Platform",
  description: "AGMs, product launches, innovation challenges and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
