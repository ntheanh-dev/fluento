package com.nta.domain.paragraph;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.hint.dto.response.HintTranslationResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController("paragraphController")
@RequestMapping("/paragraphs")
@Tag(name = "Paragraph", description = "Paragraph management APIs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Controller {
    Service service;

    @GetMapping("/{id}/hints/{orderIndex}")
    ApiResponse<HintTranslationResponse> getOrCreateHint(@PathVariable Long id, @PathVariable Integer orderIndex) {
        log.debug("Getting or creating hint for paragraph: {}, orderIndex: {}", id, orderIndex);
        return ApiResponse.<HintTranslationResponse>builder()
                .result(service.getOrCreateHint(id, orderIndex))
                .message("Hint created successfully")
                .build();
    }
}
