package com.nta.domain.userSentenceAnswer;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import com.nta.domain.userPractice.UserPractice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_sentence_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSentenceAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String paragraphText;

    @Column(columnDefinition = "TEXT")
    private String originalText;

    @Column(columnDefinition = "TEXT")
    private String learnerAnswer;

    private Double score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @ManyToOne
    @JoinColumn(name = "practice_id")
    private UserPractice practice;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
