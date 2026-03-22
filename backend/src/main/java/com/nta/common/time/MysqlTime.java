package com.nta.common.time;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

/** Tham số offset cho MySQL {@code CONVERT_TZ(..., '+00:00', offset)} khi cột lưu UTC. */
public final class MysqlTime {

    private MysqlTime() {}

    /** Ví dụ {@code +07:00} cho {@code Asia/Ho_Chi_Minh}. */
    public static String utcToOffsetSuffix(ZoneId zone) {
        ZoneOffset offset = zone.getRules().getOffset(Instant.now());
        String id = offset.getId();
        return "Z".equals(id) ? "+00:00" : id;
    }
}
