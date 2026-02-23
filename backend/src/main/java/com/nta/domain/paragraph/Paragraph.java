package com.nta.domain.paragraph;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import com.nta.domain.paragraph.enums.*;
import com.nta.domain.userPractice.UserPractice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "paragraphs")
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
    @Column(name = "type")
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

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "paragraph")
    private List<UserPractice> practices;
}
