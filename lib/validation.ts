// Letterboxd usernames are 2-15 chars, alphanumeric + underscore.
const USERNAME_RE = /^[a-z0-9_]{2,15}$/i;

export function isValidLetterboxdUsername(username: string): boolean {
  return USERNAME_RE.test(username);
}
