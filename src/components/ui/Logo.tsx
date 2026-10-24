import Link from "next/link";

export function ShieldMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 28 32" fill="none" aria-hidden="true">
      <path
        d="M4 1.5h20l3 3v18L14 30.5 1 22.5v-18z"
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M8 11l4 3.5L8 18" stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 19h6" stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-md" aria-label="Commit FC home">
      <ShieldMark />
      <span className="display text-[26px] font-extrabold tracking-[0.04em]">Commit FC</span>
    </Link>
  );
}
