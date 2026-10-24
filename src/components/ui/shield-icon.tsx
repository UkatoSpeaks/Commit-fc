/** Shield logo for generated icons (ImageResponse can't read CSS variables). */
export const ICON_ACCENT = "#3DDC84";
export const ICON_BACKGROUND = "#07110C";

export function ShieldIcon({ size, radius }: { size: number; radius: number }) {
  const mark = Math.round(size * 0.62);
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ICON_BACKGROUND,
        borderRadius: radius,
      }}
    >
      <svg width={mark} height={Math.round(mark * 1.12)} viewBox="0 0 28 32" fill="none">
        <path d="M4 1.5h20l3 3v18L14 30.5 1 22.5v-18z" stroke={ICON_ACCENT} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M8 11l4 3.5L8 18" stroke={ICON_ACCENT} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 19h6" stroke={ICON_ACCENT} strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    </div>
  );
}
