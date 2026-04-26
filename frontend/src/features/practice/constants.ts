import type { CommunityScoreBand } from "@/entities/paragraphSentence/schema";
import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Briefcase,
  Building2,
  Cpu,
  Dumbbell,
  Globe,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  MapPin,
  Microscope,
  Plane,
  Tv,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";

export const TOPIC_GROUPS = [
  {
    group: 1,
    topics: [
      { value: "LIFE" },
      { value: "TECHNOLOGY" },
      { value: "CULTURE" },
      { value: "FOOD" },
    ],
  },
  {
    group: 2,
    topics: [
      { value: "HEALTH" },
      { value: "EDUCATION" },
      { value: "FITNESS" },
      { value: "MENTAL_HEALTH" },
    ],
  },
  {
    group: 3,
    topics: [
      { value: "TRAVEL" },
      { value: "TOURISM" },
      { value: "COUNTRIES" },
      { value: "LANDMARKS" },
    ],
  },
  {
    group: 4,
    topics: [
      { value: "BUSINESS" },
      { value: "SCIENCE" },
      { value: "ENTERTAINMENT" },
      { value: "SOCIETY" },
    ],
  },
];

export const SENTENCE_COUNTS = [
  { value: "TEN" },
  { value: "FIFTEEN" },
  { value: "TWENTY" },
  { value: "MAX" },
];

export const PRACTICE_TYPES = [
  { value: "DIARIES" },
  { value: "IELTS_TASK1" },
  { value: "IELTS_TASK2" },
  { value: "EMAIL" },
  { value: "STORY" },
  { value: "ESSAYS" },
];

export const TONES = [
  { value: "FORMAL" },
  { value: "FRIENDLY" },
  { value: "PROFESSIONAL" },
];

export const LEVELS = [
  { value: "A2" },
  { value: "B1" },
  { value: "B2" },
  { value: "C1" },
];

export const SENTENCE_COUNT_NUMBER: Record<string, number> = {
  TEN: 10,
  FIFTEEN: 15,
  TWENTY: 20,
  MAX: 30,
};

export const TOPIC_ICONS: Record<string, LucideIcon> = {
  LIFE: Home,
  TECHNOLOGY: Cpu,
  CULTURE: UsersRound,
  FOOD: UtensilsCrossed,
  HEALTH: HeartPulse,
  EDUCATION: GraduationCap,
  FITNESS: Dumbbell,
  MENTAL_HEALTH: Brain,
  TRAVEL: Plane,
  TOURISM: MapPin,
  COUNTRIES: Globe,
  LANDMARKS: Landmark,
  BUSINESS: Briefcase,
  SCIENCE: Microscope,
  ENTERTAINMENT: Tv,
  SOCIETY: Building2,
};

export const SINGLE_SENTENCE_MIX_VALUES = [
  "STATEMENT",
  "QUESTION",
  "REQUEST",
  "PAST",
  "PRESENT",
  "FUTURE",
] as const;

export const COMMUNITY_SCORE_BANDS: { band: CommunityScoreBand; label: string }[] = [
  { band: "LE7", label: "6" },
  { band: "RANGE_7_8", label: "7" },
  { band: "GE8", label: "8" },
];

export const VOCABULARY_ALREADY_IN_DECK_CODE = 4005;

export const SPEECH_LANG_BY_TARGET: Record<"EN" | "ZH" | "KO", string> = {
  EN: "en-US",
  ZH: "zh-CN",
  KO: "ko-KR",
};
