package com.nta.enums;

import java.util.Arrays;

public enum Topic {
    // Group 1: Daily life & general
    LIFE(1),
    TECHNOLOGY(1),
    CULTURE(1),
    FOOD(1),
    ENVIRONMENT(1),
    // Group 2: Health & education
    HEALTH(2),
    EDUCATION(2),
    FITNESS(2),
    YOGA(2),
    NUTRITION(2),
    MENTAL_HEALTH(2),
    MEDICINE(2),
    // Group 3: Travel & geography
    TRAVEL(3),
    TOURISM(3),
    COUNTRIES(3),
    LANDMARKS(3),
    TRANSPORTATION(3),
    WEATHER(3),
    // Group 4: Business & economy
    BUSINESS(4),
    SCIENCE(4),
    ECONOMICS(4),
    MARKETING(4),
    FINANCE(4),
    STARTUPS(4),
    ECOMMERCE(4),
    // Group 5: Arts, entertainment & sports
    ART(5),
    HISTORY(5),
    LITERATURE(5),
    PHILOSOPHY(5),
    PSYCHOLOGY(5),
    MUSIC(5),
    MOVIES(5),
    THEATRE(5),
    FASHION(5),
    GAMES(5),
    SPORTS(5),
    ENTERTAINMENT(5),
    // Group 6: Society & community
    POLITICS(6),
    RELIGION(6),
    SOCIETY(6),
    SHOPPING(6),
    HOUSEWORK(6),
    RELATIONSHIPS(6),
    PETS(6),
    HOLIDAYS(6),
    CLIMATE_CHANGE(6),
    SUSTAINABILITY(6),
    GLOBALIZATION(6),
    POVERTY(6),
    HUMAN_RIGHTS(6),
    PARENTING(6),
    MARRIAGE(6),
    COMMUNITY(6),
    VOLUNTEERING(6),
    TRADITIONS(6);

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
        return Arrays.stream(values())
                .filter(t -> t.group == group)
                .toArray(Topic[]::new);
    }
}
