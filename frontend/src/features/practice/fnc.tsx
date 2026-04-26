import { diffChars, diffWords } from "diff";
import type { TargetLanguage } from "@/shared/constants/target-language";

export function renderBacktickHighlight(text: string) {
    const regex = /`([^`]*)`|'([^']*)'/g;
    const result: any[] = [];

    let lastIndex = 0;

    for (const match of text.matchAll(regex)) {
        const start = match.index!;
        const end = start + match[0].length;

        // text bình thường
        if (start > lastIndex) {
            result.push(
                <span key={lastIndex}>{text.slice(lastIndex, start)}</span>
            );
        }

        // nội dung highlight (ưu tiên group nào match)
        const highlightedText = match[1] ?? match[2];

        result.push(
            <span key={start} className="font-semibold text-amber-400">
                {highlightedText}
            </span>
        );

        lastIndex = end;
    }

    // phần còn lại
    if (lastIndex < text.length) {
        result.push(
            <span key={lastIndex}>{text.slice(lastIndex)}</span>
        );
    }

    return result;
}
export function renderWordDiff(oldText: string, newText: string, targetLanguage: TargetLanguage = "EN") {
    const isCharDiffLanguage = targetLanguage === "ZH" || targetLanguage === "KO";
    const changes = isCharDiffLanguage
        ? diffChars(oldText, newText)
        : diffWords(oldText, newText);
    return changes.map((part, index) => {
        const spacer = isCharDiffLanguage ? "" : " ";
        if (part.added) {
            return (
                <span key={index} className="text-green-600 font-medium">
                    {part.value}{spacer}
                </span>
            );
        }
        if (part.removed) {
            return (
                <>
                    <span key={index} className="text-red-500 line-through">
                        {part.value}
                    </span>
                    {spacer}
                </>

            );
        }
        return <span key={index}>{part.value}{spacer}</span>;
    });
}