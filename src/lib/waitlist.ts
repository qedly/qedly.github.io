/**
 * The Buttondown waitlist (spec 042 FR-044). The form posts itself to Buttondown's embed-subscribe route, never
 * with fetch, because a subscriber may need to finish a CAPTCHA or fix a typo on Buttondown's page.
 * The route is /api/emails/embed-subscribe/<user>; /<user>/embed-subscribe returns 404 (checked 2026-09-29).
 */
/** workspace and cloud are product waitlists; partners is the design-partner list on /partners/; code is early access to QEDly Code. */
export const WAITLIST_TAGS = ["workspace", "cloud", "partners", "code"] as const;
export type WaitlistTag = (typeof WAITLIST_TAGS)[number];

export function waitlistAction(user: string): string {
  return `https://buttondown.com/api/emails/embed-subscribe/${encodeURIComponent(user)}`;
}
