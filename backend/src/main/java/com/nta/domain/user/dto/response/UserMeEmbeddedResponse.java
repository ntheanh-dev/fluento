package com.nta.domain.user.dto.response;

import java.util.List;

import com.nta.domain.apikey.dto.response.AiModelResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Phần embedded trong GET /me?embedded=... */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMeEmbeddedResponse {
    /** Danh sách API key (flat, mỗi row = key + model), apiKey đã decrypt. */
    private List<AiModelResponse> apiKey;

    /** Tổng số câu trả lời (UserSentenceAnswer) đã submit của user hiện tại. */
    private Long totalUserSentenceAnswers;

    /** Điểm trung bình (score) trên các UserSentenceAnswer đã submit của user hiện tại. */
    private Double avgUserSentenceAnswerScore;

    /** Tổng thời gian luyện tập (ms) của user hiện tại (tổng learningTime các UserPractice). */
    private Long totalLearningTime;
}
