package com.nta.entity;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "topic_group")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "topicGroup", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Set<Topic> topics;
}
