import type { TFunction } from "i18next";

/** User skill tier from total sentence answers (same thresholds as former getLevel). */
export function getLevelLabel(sentenceCount: number, t: TFunction): string {
  if (sentenceCount < 150) return t("profile.level.beginner");
  if (sentenceCount < 300) return t("profile.level.intermediate");
  return t("profile.level.advanced");
}
