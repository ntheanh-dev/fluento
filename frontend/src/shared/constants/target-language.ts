export type TargetLanguage = "EN" | "ZH" | "KO";
export type TargetLanguageCountryCode = "US" | "CN" | "KR";

export const TARGET_LANGUAGE_ITEMS: Array<{
  value: TargetLanguage;
  name: string;
  countryCode: TargetLanguageCountryCode;
}> = [
  { value: "EN", name: "English", countryCode: "US" },
  { value: "ZH", name: "Chinese", countryCode: "CN" },
  { value: "KO", name: "Korean", countryCode: "KR" },
];

export const TARGET_LANGUAGE_COUNTRY_CODE: Record<TargetLanguage, TargetLanguageCountryCode> = {
  EN: "US",
  ZH: "CN",
  KO: "KR",
};
