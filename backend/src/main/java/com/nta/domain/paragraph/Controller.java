package com.nta.domain.paragraph;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.paragraph.dto.response.ParagraphResponse;
import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.SentenceCount;
import com.nta.domain.paragraph.enums.Tone;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController("paragraphController")
@RequestMapping("/paragraphs")
@Tag(name = "Paragraph", description = "Paragraph APIs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Controller {
    Service service;

    @GetMapping
    ApiResponse<Page<ParagraphResponse>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String tone,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String sentenceCount,
            @RequestParam(required = false, defaultValue = "desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Type typeEnum = type != null && !type.isBlank() ? Type.fromString(type) : null;
        Tone toneEnum = tone != null && !tone.isBlank() ? Tone.fromString(tone) : null;
        Topic topicEnum = topic != null && !topic.isBlank() ? Topic.fromString(topic) : null;
        Level levelEnum = level != null && !level.isBlank() ? Level.fromString(level) : null;
        SentenceCount sentenceCountEnum =
                sentenceCount != null && !sentenceCount.isBlank() ? SentenceCount.fromString(sentenceCount) : null;
        Page<ParagraphResponse> paragraphs =
                service.getAllFiltered(typeEnum, toneEnum, topicEnum, levelEnum, sentenceCountEnum, sort, page, size);

        return ApiResponse.<Page<ParagraphResponse>>builder().result(paragraphs).build();
    }
}
