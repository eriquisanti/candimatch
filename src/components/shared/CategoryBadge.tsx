import { CATEGORY_META } from "@/lib/categoryDisplay";
import type { ProposalCategory } from "@/types";

export function CategoryBadge({ category }: { category: ProposalCategory }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${meta.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {category}
    </span>
  );
}
