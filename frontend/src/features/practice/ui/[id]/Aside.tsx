import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";
import type { VocabularyHint } from "@/entities/paragraphSentence/schema";
import { Analyzing } from "./Analyzing";
import { VocabularyHintsAside } from "./HintsAside";
import { DetailedSuggestionCard } from "./DetailedSuggestionCard";
import { Lightbulb } from "lucide-react";
import type { RenderAsideType } from ".";
import { useTranslation } from "react-i18next";

type AsideProps = {
  isLoadingAnswerPreview: boolean;
  isLoadingVocabularyHints: boolean;
  vocabularyHints: VocabularyHint[] | null;
  /** Câu đang luyện — dùng để tải bản dịch cộng đồng. */
  hintsSentenceId: number;
  renderAsideType: RenderAsideType;
  feedback: SentenceFeedback | null;
  userTranslation?: string;
  streamingFeedback?: Partial<SentenceFeedback> | null;
  streamingFeedbackText?: string;
};

export const Aside = ({
  isLoadingAnswerPreview,
  isLoadingVocabularyHints,
  vocabularyHints,
  hintsSentenceId,
  renderAsideType,
  feedback,
  userTranslation,
  streamingFeedback,
  streamingFeedbackText,
}: AsideProps) => {
  const { t } = useTranslation();
  const hasStreamingFeedbackData =
    streamingFeedback != null && (
      streamingFeedback.correction != null
      || streamingFeedback.improved != null
      || streamingFeedback.summary != null
      || streamingFeedback.score != null
      || (streamingFeedback.suggestions != null && streamingFeedback.suggestions.length > 0)
    );

  if (isLoadingVocabularyHints) {
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
    if (isLoadingAnswerPreview && hasStreamingFeedbackData) {
      return (
        <DetailedSuggestionCard
          feedback={streamingFeedback}
          userTranslation={userTranslation}
          isStreaming
        />
      );
    }
    if (isLoadingAnswerPreview && streamingFeedbackText?.trim()) {
      return (
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="whitespace-pre-wrap break-words text-xs leading-6 text-slate-700 dark:text-slate-200">
            {streamingFeedbackText}
          </pre>
        </div>
      );
    }
    if (!feedback) {
      return <Analyzing />;
    }
    return (
      <DetailedSuggestionCard
        feedback={feedback}
        userTranslation={userTranslation}
        isStreaming={false}
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
          {t("practice.session.needHelpTitle")}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px] mx-auto">
          {t("practice.session.needHelpBody")}
        </p>
      </div>
    </>
  );
};