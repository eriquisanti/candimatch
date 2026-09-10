import { Heart, X } from "lucide-react";
import type { CompatibilityItem } from "@/utils/calculateMatch";

interface CompatibilityBreakdownProps {
  items: CompatibilityItem[];
}

export function CompatibilityBreakdown({ items }: CompatibilityBreakdownProps) {
  if (items.length === 0) return null;

  return (
    <section className="w-full max-w-sm">
      <h3 className="mb-4 text-center text-lg font-bold text-zinc-900">Por que vocês combinaram?</h3>
      <ul className="flex flex-col gap-3">
        {items.map(({ proposal, agreed }) => (
          <li
            key={proposal.id}
            className={`rounded-2xl border p-4 ${
              agreed ? "border-emerald-100 bg-emerald-50" : "border-zinc-200 bg-zinc-50"
            }`}
          >
            <p className="flex items-center gap-2 text-sm font-bold text-zinc-800">
              {agreed ? (
                <Heart className="h-4 w-4 text-emerald-600" fill="currentColor" strokeWidth={0} aria-hidden />
              ) : (
                <X className="h-4 w-4 text-zinc-400" strokeWidth={3} aria-hidden />
              )}
              {proposal.category}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {agreed ? "Vocês concordam com esta proposta." : "Vocês discordam nesta proposta."}
            </p>
            <p className="mt-2 text-sm italic text-zinc-400">&ldquo;{proposal.text}&rdquo;</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
