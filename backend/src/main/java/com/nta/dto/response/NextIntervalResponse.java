package com.nta.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NextIntervalResponse {
    
    private String againInterval;  // Format: "(1 phút)"
    private String hardInterval;   // Format: "(2 phút)"
    private String goodInterval;   // Format: "(6 phút)"
    private String easyInterval;   // Format: "(24 phút)"
    
    // Raw interval values in minutes for debugging/analysis
    private Integer againMinutes;
    private Integer hardMinutes;
    private Integer goodMinutes;
    private Integer easyMinutes;
}
