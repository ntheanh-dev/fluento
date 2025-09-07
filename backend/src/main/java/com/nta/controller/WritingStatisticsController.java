package com.nta.controller;

import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.WritingStatisticsResponse;
import com.nta.service.AuthService;
import com.nta.service.WritingStatisticsService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/writing-statistics")
@RequiredArgsConstructor
public class WritingStatisticsController {

    private final WritingStatisticsService writingStatisticsService;
    private final AuthService authService;

    @GetMapping("")
    public ApiResponse<WritingStatisticsResponse> getWritingStatistics() {
        // Get user ID from JWT token
        final Long userId = authService.getUserIdFromSecurityContext();
        WritingStatisticsResponse statistics =
                writingStatisticsService.getWritingStatistics(userId);
        return ApiResponse.<WritingStatisticsResponse>builder().result(statistics).build();
    }
}
