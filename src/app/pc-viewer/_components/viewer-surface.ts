export const viewerGlassSurfaceClass =
  "border border-zinc-300/50 dark:border-zinc-700/50 backdrop-blur-md bg-gradient-to-b from-zinc-200/35 via-zinc-300/25 to-zinc-500/20 dark:from-zinc-800/35 dark:via-zinc-700/25 dark:to-zinc-900/20";

export const viewerGlassSurfaceStyle = {
  backgroundImage:
    "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 10%, rgba(255,255,255,0) 25%), linear-gradient(180deg, var(--tw-gradient-from), var(--tw-gradient-to))",
  backgroundBlendMode: "screen, normal" as const,
};

export const viewerGlassInnerClass =
  "rounded-xl border border-zinc-300/60 dark:border-zinc-700/60 bg-white/55 dark:bg-zinc-900/35 backdrop-blur";