import { Flame, MapPin, Shield } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import type { Player } from "@/lib/stats";
import { roleName } from "@/lib/ui/card-data";
import { ratingReasons } from "@/lib/ui/reasons";
import { TIER_MATERIALS } from "@/lib/ui/tiers";
import { referenceDate, suggestUpgrades } from "@/lib/ui/upgrades";
import { RatingReasons } from "./RatingReasons";
import { ReadmeSnippet } from "./ReadmeSnippet";
import { TierProgress } from "./TierProgress";
import { UpgradeList } from "./UpgradeList";

export function ScoutReport({ player }: { player: Player }) {
  const { profile, extras } = player;
  const now = referenceDate(profile);
  const tier = TIER_MATERIALS[player.tier];

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <header>
        <p className="mono-label text-xs text-accent">Scout report · @{profile.login}</p>
        <h1 className="display mt-3 text-[44px] font-extrabold sm:text-6xl lg:text-[76px]">
          {player.overall} · {roleName(player)} {player.position.pitch}
        </h1>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Player details">
          <li>
            <Chip fill={tier.dot}>{tier.label}</Chip>
          </li>
          {profile.location && (
            <li>
              <Chip icon={<MapPin size={13} aria-hidden="true" />}>{profile.location}</Chip>
            </li>
          )}
          {extras.club && (
            <li>
              <Chip icon={<Shield size={13} aria-hidden="true" />}>Club · {extras.club}</Chip>
            </li>
          )}
          <li>
            <Chip icon={<Flame size={13} aria-hidden="true" />}>
              Best streak · {extras.streaks.longest} {extras.streaks.longest === 1 ? "day" : "days"}
            </Chip>
          </li>
        </ul>
      </header>

      <TierProgress overall={player.overall} />
      <RatingReasons stats={player.stats} reasons={ratingReasons(profile, now)} />
      <UpgradeList upgrades={suggestUpgrades(profile, now)} />
      <ReadmeSnippet login={profile.login} />
    </div>
  );
}
