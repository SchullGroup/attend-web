import { LandingNavbar } from "./_components/Navbar";
import { LandingFooter } from "./_components/Footer";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @keyframes floatA { 0%,100% { transform: rotate(-2deg) translateY(0); } 50% { transform: rotate(-2deg) translateY(-10px); } }
        @keyframes floatB { 0%,100% { transform: rotate(1.5deg) translateY(0); } 50% { transform: rotate(1.5deg) translateY(-8px); } }
        @keyframes floatC { 0%,100% { transform: rotate(-0.5deg) translateY(0); } 50% { transform: rotate(-0.5deg) translateY(-13px); } }
        html { scroll-behavior: smooth; }
      `}</style>
      <LandingNavbar />
      <div style={{ fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif" }}>
        {children}
      </div>
      <LandingFooter />
    </>
  );
}
