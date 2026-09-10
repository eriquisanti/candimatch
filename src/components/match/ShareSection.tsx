"use client";

import { useRef, useState, type ChangeEvent } from "react";
import html2canvas from "html2canvas-pro";
import { Camera, Heart, Loader2, Share2, User } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { CandidateAvatar } from "@/components/shared/CandidateAvatar";
import type { CandidateMatch } from "@/types";

interface ShareSectionProps {
  match: CandidateMatch;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ShareSection({ match }: ShareSectionProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 3500);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setUserPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleShare() {
    if (!cardRef.current || isSharing) return;
    setIsSharing(true);
    try {

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
          const crossOriginImages = Array.from(clonedDoc.querySelectorAll("img")).filter((img) => {
            if (!/^https?:\/\//.test(img.src)) return false;
            try {
              return new URL(img.src).origin !== window.location.origin;
            } catch {
              return false;
            }
          });

          return Promise.all(
            crossOriginImages.map(
              (img) =>
                new Promise<void>((resolve) => {
                  img.crossOrigin = "anonymous";
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                  img.src = `/api/image-proxy?url=${encodeURIComponent(img.src)}`;
                })
            )
          );
        },
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Falha ao gerar imagem do card");

      const file = new File([blob], "candimatch.png", { type: "image/png" });
      const shareText = `Meu match no CandiMatch: ${match.candidate.name} (${match.percentage}% de compatibilidade)`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "CandiMatch", text: shareText });
        showFeedback("Compartilhado!");
      } else {
        downloadBlob(blob, "candimatch.png");
        showFeedback("Imagem baixada — é só compartilhar de onde salvou.");
      }
    } catch (error) {

      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Falha ao gerar/compartilhar imagem do card:", error);
      showFeedback("Não foi possível gerar a imagem agora. Tenta de novo?");
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <section className="flex w-full flex-col items-center gap-2.5">
      <div
        ref={cardRef}
        className="w-full max-w-sm overflow-hidden rounded-[28px] bg-gradient-to-br from-rose-500 via-fuchsia-500 to-orange-400 p-4 text-center text-white shadow-2xl shadow-rose-500/30 ring-1 ring-white/25 sm:p-5"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">CandiMatch</p>

        <div className="my-3 flex items-center justify-center">
          {userPhoto ? (
            <img
              src={userPhoto}
              alt="Sua foto"
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white/70 sm:h-16 sm:w-16"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-white/50 bg-white/10 sm:h-16 sm:w-16">
              <User className="h-6 w-6 text-white/80 sm:h-7 sm:w-7" />
            </div>
          )}
          <Heart className="z-10 -mx-2 h-5 w-5 fill-red-500 text-red-500" />
          <CandidateAvatar candidate={match.candidate} size="md" className="ring-4 ring-white/70" />
        </div>

        <p className="text-4xl font-black leading-none sm:text-5xl">{match.percentage}%</p>
        <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">de compatibilidade</p>

        <p className="mt-3 text-base font-bold">{match.candidate.name}</p>
        <p className="text-xs text-white/70">
          {match.matchCount} de {match.totalAnswered} propostas
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2">
        <Button size="sm" onClick={handleShare} disabled={isSharing} className="w-full">
          {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          {isSharing ? "Gerando imagem..." : "Compartilhar meu match"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
          <Camera className="h-4 w-4" />
          {userPhoto ? "Trocar minha foto" : "Adicionar minha foto"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      {feedback && (
        <p className="w-full max-w-sm rounded-xl bg-white/70 px-4 py-2 text-center text-sm font-medium text-zinc-600 backdrop-blur-sm">
          {feedback}
        </p>
      )}
    </section>
  );
}
