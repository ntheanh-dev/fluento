package com.nta.domain.apikey;

import lombok.Getter;

@Getter
public enum LimitPerDay {
    FREE(10),
    BASIC(50),
    STANDARD(100),
    PRO(500),
    UNLIMITED(null);

    private final Integer maxRequests;

    LimitPerDay(Integer maxRequests) {
        this.maxRequests = maxRequests;
    }

    /** True nếu không giới hạn (UNLIMITED). */
    public boolean isUnlimited() {
        return maxRequests == null;
    }
}
