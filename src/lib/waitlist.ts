/**
 * The Buttondown waitlist (spec 042 FR-044). Buttondown's docs say to post the form itself to embed-subscribe,
 * never with fetch, because a subscriber may need to finish a CAPTCHA or fix a typo on Buttondown's page.
 */
export const WAITLIST_TAGS = ["workspace", "cloud"] as const;
export type WaitlistTag = (typeof WAITLIST_TAGS)[number];

export function waitlistAction(user: string): string {
  return `https://buttondown.com/${encodeURIComponent(user)}/embed-subscribe`;
}
