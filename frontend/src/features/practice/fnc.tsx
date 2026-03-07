export function renderCorrectionLine(correction: string) {
    const parts = correction.split(/(\([^)]+\))/g);
    return parts.map((part, index) => {
        if (!part) return null;
        if (part.startsWith("(") && part.endsWith(")")) {
            return (
                <span key={index} className="text-red-400 font-semibold">
                    {part}
                </span>
            );
        }
        return (
            <span key={index} className="text-slate-600">
                {part}
            </span>
        );
    });
}