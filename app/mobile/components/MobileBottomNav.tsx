import Link from "next/link";
import type { MobileTabId } from "../types";

type MobileBottomNavProps = {
  activeTab: MobileTabId;
};

const tabs: { id: MobileTabId; label: string; icon: string; href: string; disabled?: boolean }[] = [
  { id: "missions", label: "Missionen", icon: "🎯", href: "/mobile/missionen" },
  { id: "buddy", label: "Buddy", icon: "🐉", href: "/mobile/buddy" },
  { id: "scan", label: "Analyse", icon: "📷", href: "/mobile/analyse" },
  { id: "settings", label: "Setup", icon: "⚙️", href: "/mobile/bewegung" },
];

export default function MobileBottomNav({ activeTab }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-[#042f35]/95 px-3 py-2 backdrop-blur-md">
      <div className="grid grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const className = `rounded-2xl px-2 py-2 text-center text-xs font-black ${isActive ? "bg-orange-400 text-[#042f35]" : "text-white/70"} ${tab.disabled ? "opacity-45" : ""}`;
          const content = (
            <>
              <div className="text-lg leading-none">{tab.icon}</div>
              <div className="mt-1">{tab.label}</div>
            </>
          );

          if (tab.disabled) return <div key={tab.id} className={className}>{content}</div>;
          return <Link key={tab.id} href={tab.href} className={className}>{content}</Link>;
        })}
      </div>
    </nav>
  );
}
