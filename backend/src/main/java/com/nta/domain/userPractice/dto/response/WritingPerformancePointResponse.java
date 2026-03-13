package com.nta.domain.userPractice.dto.response;

import java.time.LocalDate;

public record WritingPerformancePointResponse(LocalDate date, String label, Double score, Long totalSentences) {}
