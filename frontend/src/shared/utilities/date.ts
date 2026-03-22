/** Khớp backend {@code app.time-zone} — hiển thị ngày/giờ nghiệp vụ thống nhất. */
export const APP_TIME_ZONE = "Asia/Ho_Chi_Minh";

const dateOpts: Intl.DateTimeFormatOptions = {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
};

/**
 * Format ISO date string to Vietnamese locale (DD/MM/YYYY).
 * Returns "—" for null, empty or invalid dates.
 */
export function formatCreatedAt(createdAt: string | null): string {
    if (!createdAt) return "—";
    try {
        const d = new Date(createdAt);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("vi-VN", dateOpts);
    } catch {
        return "—";
    }
}

/**
 * Format ISO datetime to Vietnamese locale (date + time).
 */
export function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return "—";
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleString("vi-VN", {
            ...dateOpts,
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "—";
    }
}
