package com.nta.entity;

import java.util.List;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fields")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "note_type_id", nullable = false)
    private Long noteTypeId;

    @Column(name = "field_order")
    private Integer fieldOrder = 0;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_type_id", insertable = false, updatable = false)
    private NoteType noteType;

    @OneToMany(mappedBy = "fieldId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<NoteField> noteFields;
}
