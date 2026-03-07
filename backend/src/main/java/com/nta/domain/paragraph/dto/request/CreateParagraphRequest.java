package com.nta.domain.paragraph.dto.request;

import jakarta.validation.constraints.NotNull;

import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.SentenceCount;
import com.nta.domain.paragraph.enums.Tone;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request to generate a paragraph based on given constraints")
public class CreateParagraphRequest {

    @NotNull
    @Schema(description = "Paragraph type", example = "BASIC")
    private Type type;

    @NotNull
    @Schema(description = "Writing tone", example = "FORMAL")
    private Tone tone;

    @NotNull
    @Schema(description = "Paragraph topic", example = "EDUCATION")
    private Topic topic;

    @NotNull
    @Schema(description = "Difficulty level", example = "A2")
    private Level level;

    @Schema(description = "Sentence count", example = "TEN")
    private SentenceCount sentenceCount;
}
