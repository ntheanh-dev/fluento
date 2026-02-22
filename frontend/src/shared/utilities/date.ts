/**
 * Format ISO date string to Vietnamese locale (DD/MM/YYYY).
 * Returns "—" for null, empty or invalid dates.
 */
export function formatCreatedAt(createdAt: string | null): string {
    if (!createdAt) return "—";
    try {
        const d = new Date(createdAt);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}
