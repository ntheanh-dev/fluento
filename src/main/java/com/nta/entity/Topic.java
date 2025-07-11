package com.nta.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "topics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Topic {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // "life", "health", etc.

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "prompt_template", columnDefinition = "TEXT")
    private String promptTemplate;
}
