import { ReactNode } from "react";

export default function PrimaryButton({ children, onClick, type = "button" }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full rounded-2xl bg-gradient-to-r from-[#00FFA3] to-[#00D1FF] px-6 py-3 font-semibold text-black shadow-lg hover:opacity-90 transition"
    >
      {children}
    </button>
  );
}
