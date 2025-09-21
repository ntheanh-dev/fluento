package com.nta.dto.response;

import java.util.List;

import lombok.Data;

@Data
public class NoteTypeResponse {

    private Long id;
    private String name;
    private List<FieldResponse> fields;
    private Long noteCount;

    @Data
    public static class FieldResponse {
        private Long id;
        private String name;
        private Integer fieldOrder;
        private Boolean isRequired;
    }
}
