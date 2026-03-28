package com.nta.domain.paragraphSentence.enums;

import lombok.Getter;

/** Mốc điểm AI để lọc bản dịch cộng đồng (thang ~0–10). */
@Getter
public enum CommunityScoreBand {
    /** Điểm ≤ 7 */
    LE7(0),
    /** 7 < điểm ≤ 8 */
    RANGE_7_8(1),
    /** Điểm > 8 (thường tới 10) */
    GE8(2);

    private final int queryIndex;

    CommunityScoreBand(int queryIndex) {
        this.queryIndex = queryIndex;
    }

    /** Query param: LE7 | RANGE_7_8 | GE8 (không phân biệt hoa thường). Không khớp → LE7. */
    public static CommunityScoreBand fromParam(String raw) {
        if (raw == null || raw.isBlank()) {
            return LE7;
        }
        return switch (raw.trim().toUpperCase().replace('-', '_')) {
            case "LE7", "LTE7" -> LE7;
            case "RANGE_7_8", "7_8", "MID", "BAND_7_8" -> RANGE_7_8;
            case "GE8", "GT8", "HIGH", "8_10", "BAND_8" -> GE8;
            default -> LE7;
        };
    }
}
