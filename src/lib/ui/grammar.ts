/**
 * "a" or "an" before a rating. Ratings are always 40–99, so only the
 * eighties ("an 82-rated…") start with a vowel sound.
 */
export function aOrAn(rating: number): "a" | "an" {
  return rating >= 80 && rating <= 89 ? "an" : "a";
}
