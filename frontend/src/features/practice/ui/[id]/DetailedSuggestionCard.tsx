import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";
import { Copy, Sparkles } from "lucide-react";
import { renderBacktickHighlight, renderWordDiff } from "../../fnc";

export type DetailedSuggestionCardProps = {
  feedback: SentenceFeedback | null;
  userTranslation?: string;
};

export function DetailedSuggestionCard({
  feedback,
  userTranslation,
}: DetailedSuggestionCardProps) {
  if (!feedback) {
    return <></>;
  }

  const { correction, suggestions, summary, score, improved } = feedback;

  return (
    <div className="flex flex-col p-4 gap-4 text-[11px] leading-relaxed text-slate-800 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
      {/* Score chip */}
      {typeof score === "number" && (
        <div className="flex items-center gap-2 text-[10px]">
          <div className="relative size-9">
            <svg className="size-full -rotate-90 text-slate-200" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={
                  score >= 9
                    ? "text-emerald-500"
                    : score >= 7
                      ? "text-blue-500"
                      : "text-amber-500"
                }
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${Math.min(Math.max(score * 10, 0), 100)}, 100`}
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-800">
                {score.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-900">
              Điểm chi tiết
            </span>
            <span className="text-[10px] text-slate-500">
              {score >= 9
                ? "Rất tốt – chỉ còn vài điểm nhỏ cần chỉnh."
                : score >= 7
                  ? "Khá tốt – cần sửa một số lỗi về thì/từ vựng."
                  : "Cần luyện thêm – nên xem kỹ các gợi ý bên dưới."}
            </span>
          </div>
        </div>
      )}

      {correction != null && correction !== "" && (
        <p className="text-[11px] font-bold text-orange-600">
          Chỉnh sửa:
          <span className="ml-1 font-semibold text-slate-800">
            {userTranslation?.trim()
              ? renderWordDiff(userTranslation.trim(), correction)
              : correction}
          </span>
        </p>
      )}

      {/* Suggested improvements */}
      {suggestions?.length > 0 && (
        <div>
          <p className="text-[12px] font-semibold text-slate-800 mb-1">
            Cải thiện:
          </p>
          <ul className="space-y-1 pl-4 list-disc text-slate-700">
            {suggestions.map((item, idx) => (
              <li key={idx} className="text-[12px]">
                {renderBacktickHighlight(item)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="mt-1">
          <p className="font-bold text-emerald-600 mb-1">Nhận xét:</p>
          <p className="text-[12px] text-slate-700">
            {renderBacktickHighlight(summary)}
          </p>
        </div>
      )}

      {improved && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold text-green-700 flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Gợi ý
            </span>
            <button
              className="text-green-600 hover:text-green-700 transition-colors"
              title="Copy"
            >
              <Copy
                className="size-3.5"
                onClick={() => navigator.clipboard.writeText(improved)}
              />
            </button>
          </div>
          <p className="text-[12px] text-slate-800">
            {improved}
          </p>
        </div>
      )}
    </div>
  );
}
