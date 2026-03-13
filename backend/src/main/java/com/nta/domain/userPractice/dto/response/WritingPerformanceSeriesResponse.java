package com.nta.domain.userPractice.dto.response;

import java.util.List;

public record WritingPerformanceSeriesResponse(String range, List<WritingPerformancePointResponse> points) {}
