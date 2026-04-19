/** Daily credits — must stay aligned with product/backend where applicable. */
export const FREE_CREDITS_PER_DAY = 30;
export const PRO_CREDITS_PER_DAY = 500;

/** Pro tier — monthly subscription (VND) */
export const PRO_PRICE_VND = 250_000;

export const TOPUP_PACKS = [
  { price: 10_000, base: 100, bonusPct: 0 },
  { price: 20_000, base: 200, bonusPct: 5 },
  { price: 50_000, base: 500, bonusPct: 10 },
  { price: 100_000, base: 1000, bonusPct: 20 },
] as const;

/**
 * Coin → credit packs. Must match backend {@code UserService.COIN_EXCHANGE_CREDITS}.
 */
export const COIN_EXCHANGE_PACKS = [
  { coins: 10, credits: 1 },
  { coins: 20, credits: 2 },
  { coins: 50, credits: 6 },
  { coins: 100, credits: 12 },
] as const;
