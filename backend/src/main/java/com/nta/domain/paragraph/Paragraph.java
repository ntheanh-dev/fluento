package com.nta.domain.paragraph;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nta.domain.hint.Hint;
import com.nta.domain.paragraph.enums.*;
import com.nta.domain.userPractice.UserPractice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "paragraph")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paragraph {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "taskType")
    private Type type;

    @Enumerated(EnumType.STRING)
    @Column(name = "tone")
    private Tone tone;

    @Enumerated(EnumType.STRING)
    @Column(name = "topic")
    private Topic topic;

    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    private Level level;

    @Enumerated(EnumType.STRING)
    @Column(name = "sentenceCount")
    private SentenceCount sentenceCount;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "paragraph", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<UserPractice> practices;

    @OneToMany(mappedBy = "paragraph", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Hint> hints;
}
