/** Hash targets on `/profile/subscription` (elements + scroll in SubscriptionSection). */
export const SUBSCRIPTION_ANCHOR = {
  topup: "topup",
  coin: "coin",
} as const;

export type SubscriptionAnchor = (typeof SUBSCRIPTION_ANCHOR)[keyof typeof SUBSCRIPTION_ANCHOR];

export function subscriptionHref(section: keyof typeof SUBSCRIPTION_ANCHOR) {
  return `/profile/subscription#${SUBSCRIPTION_ANCHOR[section]}`;
}
