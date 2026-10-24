/** GitHub logins: 1–39 chars, alphanumeric or single hyphens, no leading/trailing hyphen. */
const USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function isValidUsername(value: string): boolean {
  return USERNAME_RE.test(value);
}
