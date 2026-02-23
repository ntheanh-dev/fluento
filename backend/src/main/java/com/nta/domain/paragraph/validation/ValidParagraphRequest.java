package com.nta.domain.paragraph.validation;

import java.lang.annotation.*;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = ParagraphRequestValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidParagraphRequest {

    String message() default "Invalid paragraph configuration for given type";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
