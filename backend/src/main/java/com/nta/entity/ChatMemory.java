package com.nta.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "spring_ai_chat_memory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMemory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private String conversationId;

    @Column(name = "role")
    private String role; // "user", "assistant", "system"

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "type", nullable = false)
    private String type; // ví dụ: "message"

    @Column(name = "timestamp", nullable = false, updatable = false, insertable = false)
    private LocalDateTime timestamp;
}
