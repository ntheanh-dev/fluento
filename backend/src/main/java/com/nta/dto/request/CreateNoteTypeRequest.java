package com.nta.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class CreateNoteTypeRequest {

    @NotBlank(message = "Note type name is required")
    @Size(max = 255, message = "Note type name must not exceed 255 characters")
    private String name;

    private List<FieldRequest> fields;

    @Data
    public static class FieldRequest {
        @NotBlank(message = "Field name is required")
        @Size(max = 255, message = "Field name must not exceed 255 characters")
        private String name;

        private Integer fieldOrder = 0;

        private Boolean isRequired = false;
    }
}
