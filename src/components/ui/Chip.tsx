import type { CSSProperties, ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  /** Solid background color (text turns dark) */
  fill?: string;
  /** Small colored dot before the text */
  dot?: string;
  icon?: ReactNode;
}

export function Chip({ children, fill, dot, icon }: ChipProps) {
  const style: CSSProperties | undefined = fill ? { background: fill, borderColor: fill, color: "#0B0F0C" } : undefined;
  return (
    <span
      className="mono-label inline-flex min-h-8 items-center gap-2 rounded-full border border-line-strong px-3 text-[11px] text-muted"
      style={style}
    >
      {dot && <span className="size-2 rounded-full" style={{ background: dot }} aria-hidden="true" />}
      {icon}
      {children}
    </span>
  );
}
