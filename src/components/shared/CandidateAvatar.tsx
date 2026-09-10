"use client";

import { useState } from "react";
import type { Candidate } from "@/types";

interface CandidateAvatarProps {
  candidate: Candidate;
  size?: "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<CandidateAvatarProps["size"]>, string> = {
  md: "h-16 w-16 text-xl",
  lg: "h-24 w-24 text-3xl",
  xl: "h-32 w-32 text-4xl",
};

export function CandidateAvatar({ candidate, size = "lg", className = "" }: CandidateAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = Boolean(candidate.photoUrl) && !imageFailed;

  if (showPhoto) {
    return (
      <img
        src={candidate.photoUrl}
        alt={candidate.name}
        onError={() => setImageFailed(true)}
        className={`shrink-0 rounded-full object-cover shadow-lg ${SIZE_CLASSES[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${candidate.colorFrom} ${candidate.colorTo} font-bold text-white shadow-lg ${SIZE_CLASSES[size]} ${className}`}
    >
      {candidate.initials}
    </div>
  );
}
