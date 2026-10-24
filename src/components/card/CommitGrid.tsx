interface CommitGridProps {
  /** 28 opacities, oldest first. Laid out 7 across, 4 down. */
  opacities: readonly number[];
  cell?: number;
  gap?: number;
}

export function CommitGrid({ opacities, cell = 8, gap = 3 }: CommitGridProps) {
  return (
    <div
      aria-hidden="true"
      style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cell}px)`, gap }}
    >
      {opacities.map((o, i) => (
        <span key={i} style={{ width: cell, height: cell, borderRadius: 1.5, background: "currentColor", opacity: o }} />
      ))}
    </div>
  );
}
