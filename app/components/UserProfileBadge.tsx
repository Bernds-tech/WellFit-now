"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type StoredUser = {
  firstName?: string;
  lastName?: string;
  name?: string;
  displayName?: string;
  email?: string;
};

const PROFILE_PHOTO_KEY = "wellfit-profile-photo";

const visiblePrefixes = [
  "/dashboard",
  "/missionen",
  "/buddy",
  "/einstellungen",
  "/leaderboard",
  "/marktplatz",
  "/punkte-shop",
  "/analytics",
];

const getName = (user: StoredUser | null) => {
  if (!user) return "Bernd";
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return user.name || user.displayName || fullName || user.email?.split("@")[0] || "Bernd";
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "WF";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function UserProfileBadge() {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [displayName, setDisplayName] = useState("Bernd");
  const [photo, setPhoto] = useState("");

  const shouldRender = useMemo(() => visiblePrefixes.some((prefix) => pathname.startsWith(prefix)), [pathname]);
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  useEffect(() => {
    if (!shouldRender) return;

    const savedUser = localStorage.getItem("wellfit-user");
    const savedPhoto = localStorage.getItem(PROFILE_PHOTO_KEY) || "";
    let parsedUser: StoredUser | null = null;

    if (savedUser) {
      try {
        parsedUser = JSON.parse(savedUser) as StoredUser;
      } catch {
        parsedUser = null;
      }
    }

    setDisplayName(getName(parsedUser));
    setPhoto(savedPhoto);
  }, [shouldRender, pathname]);

  if (!shouldRender) return null;

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const nextPhoto = typeof reader.result === "string" ? reader.result : "";
      if (!nextPhoto) return;
      localStorage.setItem(PROFILE_PHOTO_KEY, nextPhoto);
      setPhoto(nextPhoto);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed right-5 top-4 z-[70] flex flex-col items-center gap-1 text-white">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-200/70 bg-[#063b43]/95 text-lg font-black shadow-[0_10px_26px_rgba(0,0,0,0.30)] hover:border-orange-300"
        title="Profilbild ändern"
        aria-label="Profilbild ändern"
      >
        {photo ? <Image src={photo} alt={displayName} fill sizes="64px" className="object-cover" unoptimized /> : <span>{initials}</span>}
      </button>
      <p className="max-w-[110px] truncate rounded-full border border-cyan-300/20 bg-[#042f35]/90 px-3 py-1 text-center text-xs font-bold text-cyan-50 shadow-[0_6px_16px_rgba(0,0,0,0.22)]">
        {displayName}
      </p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
    </div>
  );
}
