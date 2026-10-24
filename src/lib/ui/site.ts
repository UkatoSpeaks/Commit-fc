export const REPO_URL = "https://github.com/UkatoSpeaks/commit-fc";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export function badgeMarkdown(login: string): string {
  return `![Commit FC](${siteUrl()}/api/card/${login}.svg)`;
}
