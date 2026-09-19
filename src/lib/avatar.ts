const GRADIENTS = [
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400",
  "from-sky-500 to-cyan-400",
  "from-violet-500 to-fuchsia-400",
  "from-rose-500 to-pink-400",
  "from-lime-500 to-emerald-400",
];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

export function getAvatarGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}
