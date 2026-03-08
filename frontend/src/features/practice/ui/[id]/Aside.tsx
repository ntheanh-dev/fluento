import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";
import type { HintContent } from "@/entities/hints/schema";
import { Analyzing } from "./Analyzing";
import { HintsAside } from "./HintsAside";
import { DetailedSuggestionCard } from "./DetailedSuggestionCard";
import { Lightbulb } from "lucide-react";
import type { RenderAsideType } from ".";

type AsideProps = {
  isLoadingAnswerPreview: boolean;
  isLoadingTranslationHints: boolean;
  translationHints: HintContent | null;
  renderAsideType: RenderAsideType;
  feedback: SentenceFeedback | null;
  userTranslation?: string;
  isStreaming: boolean;
};

export const Aside = ({
  isLoadingAnswerPreview,
  isLoadingTranslationHints,
  translationHints,
  renderAsideType,
  feedback,
  userTranslation,
  isStreaming,
}: AsideProps) => {

  if (isLoadingAnswerPreview || isLoadingTranslationHints || isStreaming) {
    return <Analyzing />;
  }

  if (renderAsideType === "hints" && translationHints) {
    return <HintsAside {...translationHints} />;
  }

  if (renderAsideType === "markdownFeedback") {
    return <DetailedSuggestionCard feedback={feedback} userTranslation={userTranslation} />;
  }

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="size-20 mb-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
          <Lightbulb className="size-8 text-slate-300" />
        </div>
        <h3 className="text-md font-bold text-slate-800 mb-2">
          Cần trợ giúp?
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto">
          Nhấn nút xem gợi ý để xem gợi ý từ vựng hoặc phân tích ngữ pháp.
        </p>
      </div>
    </>
  );
};