import { Heart, X } from "lucide-react";

interface SwipeButtonsProps {
  onDiscordo: () => void;
  onConcordo: () => void;
}

export function SwipeButtons({ onDiscordo, onConcordo }: SwipeButtonsProps) {
  return (
    <div className="flex items-center gap-6">
      <button
        type="button"
        onClick={onDiscordo}
        aria-label="Discordo"
        className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-zinc-200 bg-white text-rose-500 shadow-lg transition-all hover:scale-105 hover:border-rose-300 active:scale-95"
      >
        <X className="h-7 w-7" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={onConcordo}
        aria-label="Concordo"
        className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-xl shadow-rose-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <Heart className="h-8 w-8" fill="currentColor" strokeWidth={0} />
      </button>
    </div>
  );
}
