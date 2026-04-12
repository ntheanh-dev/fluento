package com.nta.common.enums;

import java.util.Arrays;

public enum Topic {
    // Group 1: Daily life (4)
    LIFE(1),
    TECHNOLOGY(1),
    CULTURE(1),
    FOOD(1),
    // Group 2: Health & education (4)
    HEALTH(2),
    EDUCATION(2),
    FITNESS(2),
    MENTAL_HEALTH(2),
    // Group 3: Travel & geography (4)
    TRAVEL(3),
    TOURISM(3),
    COUNTRIES(3),
    LANDMARKS(3),
    // Group 4: Business, science, media & society (4)
    BUSINESS(4),
    SCIENCE(4),
    ENTERTAINMENT(4),
    SOCIETY(4);

    private final int group;

    Topic(int group) {
        this.group = group;
    }

    public int getGroup() {
        return group;
    }

    /**
     * Parse from request string (e.g. "life", "climate-change") to enum.
     */
    public static Topic fromString(String s) {
        if (s == null || s.isBlank()) return null;
        String normalized = s.trim().toUpperCase().replace("-", "_");
        return Arrays.stream(values())
                .filter(t -> t.name().equals(normalized))
                .findFirst()
                .orElse(null);
    }

    /**
     * Topics that share the same group id.
     */
    public static Topic[] byGroup(int group) {
        return Arrays.stream(values()).filter(t -> t.group == group).toArray(Topic[]::new);
    }
}
