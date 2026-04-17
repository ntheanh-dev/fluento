package com.nta.domain.userPractice;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nta.domain.paragraph.Paragraph;
import com.nta.domain.user.User;
import com.nta.domain.userSentenceAnswer.UserSentenceAnswer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_practices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPractice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer attemptNumber;

    private Double score;

    private Long learningTime;

    @Column(nullable = false)
    private Integer previewCount;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "paragraph_id")
    private Paragraph paragraph;

    @OneToMany(mappedBy = "practice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<UserSentenceAnswer> sentenceAnswers;
}
