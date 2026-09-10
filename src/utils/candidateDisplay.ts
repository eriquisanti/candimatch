
const COLOR_PALETTE: readonly { colorFrom: string; colorTo: string }[] = [
  { colorFrom: "from-fuchsia-500", colorTo: "to-purple-600" },
  { colorFrom: "from-blue-500", colorTo: "to-cyan-500" },
  { colorFrom: "from-emerald-500", colorTo: "to-teal-600" },
  { colorFrom: "from-orange-500", colorTo: "to-amber-500" },
  { colorFrom: "from-rose-500", colorTo: "to-pink-600" },
  { colorFrom: "from-indigo-500", colorTo: "to-violet-600" },
  { colorFrom: "from-lime-500", colorTo: "to-green-600" },
  { colorFrom: "from-sky-500", colorTo: "to-blue-600" },
  { colorFrom: "from-red-500", colorTo: "to-rose-600" },
  { colorFrom: "from-amber-500", colorTo: "to-orange-600" },
  { colorFrom: "from-teal-500", colorTo: "to-emerald-600" },
  { colorFrom: "from-violet-500", colorTo: "to-purple-600" },
  { colorFrom: "from-cyan-500", colorTo: "to-sky-600" },
];

export function getCandidateColors(index: number): { colorFrom: string; colorTo: string } {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
