import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";
import type { VocabularyHint } from "@/entities/paragraphSentence/schema";
import { Analyzing } from "./Analyzing";
import { VocabularyHintsAside } from "./HintsAside";
import { DetailedSuggestionCard } from "./DetailedSuggestionCard";
import { Lightbulb } from "lucide-react";
import type { RenderAsideType } from ".";

type AsideProps = {
  isLoadingAnswerPreview: boolean;
  isLoadingVocabularyHints: boolean;
  vocabularyHints: VocabularyHint[] | null;
  /** Câu đang luyện — dùng để tải bản dịch cộng đồng. */
  hintsSentenceId: number;
  renderAsideType: RenderAsideType;
  feedback: SentenceFeedback | null;
  userTranslation?: string;
};

export const Aside = ({
  isLoadingAnswerPreview,
  isLoadingVocabularyHints,
  vocabularyHints,
  hintsSentenceId,
  renderAsideType,
  feedback,
  userTranslation,
}: AsideProps) => {

  if (isLoadingAnswerPreview || isLoadingVocabularyHints) {
    return <Analyzing />;
  }

  if (renderAsideType === "hints" && vocabularyHints) {
    return (
      <VocabularyHintsAside
        vocabularyHints={vocabularyHints}
        sentenceId={hintsSentenceId}
      />
    );
  }

  if (renderAsideType === "markdownFeedback") {
    if (!feedback) {
      return <Analyzing />;
    }
    return (
      <DetailedSuggestionCard
        feedback={feedback}
        userTranslation={userTranslation}
      />
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="size-20 mb-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
          <Lightbulb className="size-8 text-slate-300 dark:text-slate-500" />
        </div>
        <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 mb-2">
          Cần trợ giúp?
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px] mx-auto">
          Nhấn nút xem gợi ý để xem gợi ý từ vựng hoặc phân tích ngữ pháp.
        </p>
      </div>
    </>
  );
};