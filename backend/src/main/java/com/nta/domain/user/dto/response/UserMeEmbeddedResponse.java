package com.nta.domain.user.dto.response;

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
    /** Tổng số câu trả lời (UserSentenceAnswer) đã submit của user hiện tại. */
    private Long totalUserSentenceAnswers;

    /** Điểm trung bình (score) trên các UserSentenceAnswer đã submit của user hiện tại. */
    private Double avgUserSentenceAnswerScore;

    /** Tổng thời gian luyện tập (ms) của user hiện tại (tổng learningTime các UserPractice). */
    private Long totalLearningTime;
}
