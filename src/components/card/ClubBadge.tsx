import { clubInitials } from "@/lib/ui/card-data";

interface ClubBadgeProps {
  club: string | null;
  size?: number;
  className?: string;
}

/** Circle crest with the club repo's initials. */
export function ClubBadge({ club, size = 30, className }: ClubBadgeProps) {
  return (
    <span
      className={`font-mono font-bold ${className ?? ""}`}
      title={club ?? "Free agent"}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2px solid currentColor",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size / 3),
        letterSpacing: "0.04em",
        lineHeight: 1,
      }}
    >
      {clubInitials(club)}
    </span>
  );
}
