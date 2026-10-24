export type ButtonVariant = "primary" | "outline" | "dashed";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 font-display text-lg font-bold uppercase tracking-[0.06em] transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-[#5BE69A]",
  outline: "border border-line-strong text-text hover:border-muted hover:bg-surface",
  dashed: "border border-dashed border-accent text-accent hover:bg-accent/10",
};

/** Shared classes so links and buttons look identical. */
export function buttonClass(variant: ButtonVariant = "primary", extra = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`.trim();
}

export const cardClass = "rounded-[20px] border border-line bg-surface";
