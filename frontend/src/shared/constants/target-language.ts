export type TargetLanguage = "EN" | "ZH" | "KO";

export const TARGET_LANGUAGE_ITEMS: Array<{
  value: TargetLanguage;
  name: string;
  flag: string;
}> = [
  { value: "EN", name: "English", flag: "🇺🇸" },
  { value: "ZH", name: "Chinese", flag: "🇨🇳" },
  { value: "KO", name: "Korean", flag: "🇰🇷" },
];

export const TARGET_LANGUAGE_FLAG: Record<TargetLanguage, string> = {
  EN: "🇺🇸",
  ZH: "🇨🇳",
  KO: "🇰🇷",
};
