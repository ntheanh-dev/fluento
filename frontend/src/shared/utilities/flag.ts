import { CN, KR, US, VN } from "country-flag-icons/react/3x2";
import { createElement, type ComponentType } from "react";
import type { TargetLanguage } from "@/shared/constants/target-language";
import { TARGET_LANGUAGE_COUNTRY_CODE } from "@/shared/constants/target-language";

export type FlagCountryCode = "US" | "CN" | "KR" | "VN";

type FlagSvgComponent = ComponentType<{ className?: string }>;

const FLAG_COMPONENTS: Record<FlagCountryCode, FlagSvgComponent> = {
  US,
  CN,
  KR,
  VN,
};

export function getFlagComponent(countryCode: FlagCountryCode): FlagSvgComponent {
  return FLAG_COMPONENTS[countryCode];
}

export function getTargetLanguageCountryCode(language: TargetLanguage): FlagCountryCode {
  return TARGET_LANGUAGE_COUNTRY_CODE[language];
}

export function FlagIcon({
  countryCode,
  className,
}: {
  countryCode: FlagCountryCode;
  className?: string;
}) {
  const Flag = getFlagComponent(countryCode);
  return createElement(Flag, { className });
}
