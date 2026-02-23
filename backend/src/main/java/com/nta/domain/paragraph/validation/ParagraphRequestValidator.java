package com.nta.domain.paragraph.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;

public class ParagraphRequestValidator implements ConstraintValidator<ValidParagraphRequest, CreateParagraphRequest> {

    @Override
    public boolean isValid(CreateParagraphRequest request, ConstraintValidatorContext context) {

        if (request.getType() == null) {
            return true;
        }

        context.disableDefaultConstraintViolation();

        switch (request.getType()) {
            case CUSTOM_TEXT -> {
                if (request.getCustomText() == null || request.getCustomText().isBlank()) {

                    context.buildConstraintViolationWithTemplate("customText is required for CUSTOM_TEXT type")
                            .addPropertyNode("customText")
                            .addConstraintViolation();
                    return false;
                }

                int wordCount = request.getCustomText().trim().split("\\s+").length;

                if (wordCount > 400) {
                    context.buildConstraintViolationWithTemplate("customText must not exceed 400 words")
                            .addPropertyNode("customText")
                            .addConstraintViolation();
                    return false;
                }
            }
        }

        return true;
    }
}
