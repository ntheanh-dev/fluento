import { diffWords } from "diff";

export function renderBacktickHighlight(text: string) {
    const parts = text.split(/`([^`]+)`/g);
    return parts.map((part, index) =>
        index % 2 === 1 ? (
            <span key={index} className="font-semibold text-amber-400">
                {part}
            </span>
        ) : (
            <span key={index}>{part}</span>
        ),
    );
}

export function renderWordDiff(oldText: string, newText: string) {
    const changes = diffWords(oldText, newText);
    return changes.map((part, index) => {
        if (part.added) {
            return (
                <span key={index} className="text-green-600 font-medium">
                    {part.value}{' '}
                </span>
            );
        }
        if (part.removed) {
            return (
                <>
                    <span key={index} className="text-red-500 line-through">
                        {part.value}
                    </span>
                    {' '}
                </>

            );
        }
        return <span key={index}>{part.value}{' '}</span>;
    });
}