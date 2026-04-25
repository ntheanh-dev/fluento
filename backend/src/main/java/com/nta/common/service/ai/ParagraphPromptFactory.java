package com.nta.common.service.ai;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.paragraph.enums.SentenceCount;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ParagraphPromptFactory {
    private static final Map<String, String> SINGLE_SENTENCE_MIX_OPTIONS = new LinkedHashMap<>();

    static {
        SINGLE_SENTENCE_MIX_OPTIONS.put("STATEMENT", "statements");
        SINGLE_SENTENCE_MIX_OPTIONS.put("QUESTION", "questions");
        SINGLE_SENTENCE_MIX_OPTIONS.put("REQUEST", "requests");
        SINGLE_SENTENCE_MIX_OPTIONS.put("PAST", "past tense");
        SINGLE_SENTENCE_MIX_OPTIONS.put("PRESENT", "present tense");
        SINGLE_SENTENCE_MIX_OPTIONS.put("FUTURE", "future tense");
    }

    public PromptMessage buildPrompt(CreateParagraphRequest request) {

        return switch (request.getType()) {
            case DIARIES -> buildDiariesPrompt(request);
            case STORY, EMAIL, IELTS_TASK1, IELTS_TASK2, ESSAYS -> buildWritingPrompt(request);
            case SINGLE_SENTENCE -> buildSingleSentencePrompt(request);
        };
    }

    private PromptMessage buildDiariesPrompt(CreateParagraphRequest request) {

        int sentenceCount =
                request.getSentenceCount() != null ? request.getSentenceCount().getSize() : SentenceCount.TEN.getSize();

        String system =
                "You are an expert creator of Vietnamese diary and journal texts for English-translation practice. "
                        + "Learners will translate your Vietnamese into English, so keep phrasing clear and level-appropriate. "
                        + "Return ONLY valid JSON. No markdown, no explanation. "
                        + "Strict schema: {\"title\":\"string\",\"sentences\":[\"string\"]}. "
                        + "The \"sentences\" array must contain EXACTLY "
                        + sentenceCount
                        + " separate strings. "
                        + "Each string is ONE complete Vietnamese sentence (no line breaks inside a sentence). "
                        + "Do not use double quotes inside sentence text. "
                        + "Together, the sentences should read as one coherent diary entry or a tight sequence of entries on the same thread. "
                        + "Escape JSON correctly.";

        String user = String.format(
                """
				Write Vietnamese diary / journal content for English translation practice.

				Topic anchor: %s (weave naturally; do not mechanically repeat the topic label)
				Target difficulty (CEFR-style): %s
				Tone setting: %s
				- FORMAL: reflective, measured, like a careful personal journal.
				- FRIENDLY: warm, conversational diary voice.
				- PROFESSIONAL: clear, task- or work-day log style when the topic allows; still first person.

				Sentence rules:
				- Output EXACTLY %d items in \"sentences\"; each item is one standalone sentence.
				- Use first person (e.g. \"tôi\", \"mình\") consistently.
				- Include concrete detail: actions, places, people, feelings, or small events—not abstract filler.
				- Show continuity (same day, same stretch of time, or linked moments); optional time phrases only when natural.
				- Vocabulary and grammar must suit %s learners translating into English.
				- NEVER use placeholders like [Tên], [địa điểm], or [...]; invent believable specifics.
				- Varied sentence openings and lengths; mix statements with occasional questions or exclamations if natural.

				Title (field \"title\"):
				- 5–12 words in Vietnamese, diary-style (mood, day, or moment—not a generic essay title).
				- Must match the body content.
				""",
                request.getTopic(), request.getLevel(), request.getTone(), sentenceCount, request.getLevel());

        return new PromptMessage(system, user);
    }

    private PromptMessage buildWritingPrompt(CreateParagraphRequest request) {
        int sentenceCount =
                request.getSentenceCount() != null ? request.getSentenceCount().getSize() : SentenceCount.TEN.getSize();
        String system = "You are an expert English-learning content creator. "
                + "Task: Generate Vietnamese content for learners to translate into English. "
                + "Output: MUST strictly follow this JSON schema: {\"title\":\"string\",\"sentences\":[\"string\"]}. "
                + "IMPORTANT: Inside the JSON string values, any new line or section break MUST be represented by the literal character sequence '\\\\n' (a backslash and 'n'). "
                + "Do NOT use actual line breaks (Enter key) inside the JSON strings. "
                + "Ensure appropriate grammar, vocabulary, and structure for the given level.";

        String typeInstruction =
                switch (request.getType()) {
                    case EMAIL -> """
Write in proper email format.
Structure: Greeting, Body, and Closing.
Constraint: You MUST append the literal sequence '\\\\n' (a backslash and 'n') at the END of the greeting sentence, the last sentence of the body, and the closing sentence.
Example: "Kính gửi Quý đối tác,\\\\n", "Trân trọng,\\\\n".
CONTENT RULE: NEVER use placeholders like '[...]', '[Tên]', or '[Link]'. Instead, create REASONABLE FICTIONAL NAMES and details.
""";

                    case STORY -> """
Write as a short story with a beginning, middle, and ending.
Constraint: Use the literal string "\\n" to separate these three paragraphs.
Ensure the narrative flow is natural but the break is marked by "\\n".
""";

                    case IELTS_TASK1 -> """
						Write in IELTS Task 1 style:
					- Clear introduction
							- Body paragraphs with arguments/examples
							- Structure: Introduction, Body paragraphs, and Conclusion.
							- Constraint: Use the literal string "\\n" to separate the introduction, body, and conclusion.
							- Logical conclusion
							- Each sentence must be one element in the 'sentences' array.
							- Ensure the sentences follow a logical flow when read in order.
							- Academic tone
						""";
                    case IELTS_TASK2 -> """
							Write in IELTS Task 2 style:
							- Clear introduction
							- Body paragraphs with arguments/examples
							- Structure: Introduction, Body paragraphs, and Conclusion.
							- Constraint: Use the literal string "\\n" to separate the introduction, body, and conclusion.
							- Logical conclusion
							- Each sentence must be one element in the 'sentences' array.
							- Ensure the sentences follow a logical flow when read in order.
							- Academic tone
							""";

                    case ESSAYS -> """
Write as a short essay in Vietnamese.
- Clear thesis or main idea in the opening.
- Supporting points in the middle with examples or reasoning.
- Brief conclusion that ties back to the thesis.
- Constraint: Use the literal string "\\n" to separate introduction, body (one or more blocks), and conclusion.
- Each sentence must be one element in the 'sentences' array; order must read as a coherent essay.
- Suitable tone for the requested Tone and Level.
""";

                    default -> """
Write as a coherent structured paragraph.
Use logical transitions. If there are distinct points, separate them with the literal string "\\n".
""";
                };

        String user = String.format(
                """
					Create a %s in Vietnamese for English translation practice.

					Topic: %s
					Level: %s
					Tone: %s
					Sentences: around %d

					Type-specific Requirements:
					%s

					Translation Practice Requirements:
					- Designed for learners to translate into English.
					- Use practical and real-life context.
					- Include useful grammar patterns for English.
					- Avoid idioms or culturally specific expressions that are hard to translate.
					- Use varied sentence structures.
					- Keep difficulty appropriate for %s level.

					Title Requirements:
					- 5–12 words
					- Specific and clearly related to the content
					""",
                request.getType().getDisplayName(),
                request.getTopic(),
                request.getLevel(),
                request.getTone(),
                sentenceCount,
                typeInstruction,
                request.getLevel());

        return new PromptMessage(system, user);
    }

    private PromptMessage buildSingleSentencePrompt(CreateParagraphRequest request) {
        int sentenceCount =
                request.getSentenceCount() != null ? request.getSentenceCount().getSize() : SentenceCount.TEN.getSize();
        List<String> selectedMix = resolveSingleSentenceMix(request.getSingleSentenceMix());
        String system =
                """
				You are an expert English teacher creating learning materials for Vietnamese learners.
				Your task is to generate Vietnamese sentences that students will translate into English.
				Sentences must be natural, grammatically correct, and appropriate for the given English level.
				Return ONLY valid JSON with this schema: {"sentences":["string"]}.
				""";

        String user = String.format(
                """
				Generate about %d Vietnamese sentences for English translation practice.

				Topic: %s
				English level: %s
				Tone: %s

				Requirements:
				- Use the selected mix options below and distribute them naturally across the sentence set.
				%s
				- Sentences should feel natural in daily life
				- Keep vocabulary suitable for the specified level
				- Return ONLY valid JSON with schema {"sentences":["string"]}
				- Do NOT include numbering, bullet points, or explanations
				""",
                sentenceCount, request.getTopic(), request.getLevel(), request.getTone(), toBulletList(selectedMix));

        return new PromptMessage(system, user);
    }

    private List<String> resolveSingleSentenceMix(List<String> input) {
        if (input == null || input.isEmpty()) {
            return List.copyOf(SINGLE_SENTENCE_MIX_OPTIONS.values());
        }
        List<String> normalized = input.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(value -> value.trim().toUpperCase(Locale.ROOT))
                .distinct()
                .toList();
        List<String> selected = normalized.stream()
                .filter(SINGLE_SENTENCE_MIX_OPTIONS::containsKey)
                .map(SINGLE_SENTENCE_MIX_OPTIONS::get)
                .toList();
        if (selected.isEmpty()) {
            return List.copyOf(SINGLE_SENTENCE_MIX_OPTIONS.values());
        }
        return selected;
    }

    private String toBulletList(List<String> options) {
        return options.stream().map(option -> "* " + option).collect(Collectors.joining("\n"));
    }

    public PromptMessage buildHintTranslationPrompt(String sentence, String level) {
        final String system = "You are an English learning assistant for Vietnamese learners. "
                + "Provide vocabulary hints to help translate Vietnamese sentences into English. "
                + "Return ONLY valid JSON (no markdown, no explanations).\n\n"
                + "Use vocabulary suitable for CEFR level: "
                + level
                + ".\n"
                + "Levels:\n"
                + "A2: basic everyday vocabulary\n"
                + "B1: intermediate vocabulary for familiar topics\n"
                + "B2: upper-intermediate vocabulary for abstract ideas\n"
                + "C1: advanced nuanced vocabulary\n"
                + "C2: academic/professional vocabulary\n\n"
                + "Return ONLY a valid JSON array with this item schema:\n"
                + "[\n"
                + "    {\n"
                + "      \"vietnamese\": \"word or phrase\",\n"
                + "      \"english\": [\n"
                + "        {\n"
                + "          \"english\": \"translation\",\n"
                + "          \"partsOfSpeech\": \"part of speech\",\n"
                + "          \"ipaPronunciation\": \"IPA\"\n"
                + "        }\n"
                + "      ]\n"
                + "    }\n"
                + "]";

        String user = String.format(
                "Vietnamese sentence: \"%s\"\n\n"
                        + "Tasks:\n"
                        + "- Extract important Vietnamese words/phrases.\n"
                        + "- Provide suitable English translations for %s level learners.\n"
                        + "- Include multiple translations when useful.\n"
                        + "- Return ONLY a JSON array that strictly follows the schema.\n",
                sentence, level);

        return new PromptMessage(system, user);
    }

    public PromptMessage buildFeedbackTranslationMarkdownPrompt(String vietnamese, String translate) {
        String system =
                """
			Bạn là giáo viên tiếng Anh đang hỗ trợ người học Việt Nam cải thiện kỹ năng dịch câu.

			QUY TẮC CHUNG:
			- Trả lời HOÀN TOÀN bằng TIẾNG VIỆT, ngoại trừ ví dụ câu tiếng Anh.
			- LUÔN trả về DUY NHẤT một JSON HỢP LỆ, KHÔNG thêm bất kỳ text, markdown hay giải thích bên ngoài JSON.
			- Output phải BẮT ĐẦU bằng { và KẾT THÚC bằng }.
			- KHÔNG dùng ``` hoặc bất kỳ ký hiệu code block nào.
			- Không lặp lại cùng một lỗi nhiều lần.
			- Ưu tiên câu ngắn, súc tích, dễ đọc, tập trung vào các lỗi quan trọng.

			JSON SCHEMA (dùng đúng key, đúng kiểu dữ liệu):
			{
			"score": 0.0,
			"correction": "string",
			"suggestions": ["string", "string"],
			"summary": "string",
			"improved": "string"
			}

			DIỄN GIẢI CHI TIẾT:
			- score: Điểm số tổng quan từ 1–10 đánh giá chất lượng câu dịch.
			- correction: Câu tiếng Anh đã CHỈNH SỬA, dạng gợi ý tổng quát giống như phần "Suggestion".
			+ Viết lại toàn bộ câu theo bản dịch đúng và tự nhiên hơn.
			- improved: Câu tiếng Anh dùng từ ngữ, cấu trúc, thì, từ vựng tốt hơn.
			- suggestions: Danh sách 2–5 gợi ý chi tiết bằng tiếng Việt, mỗi phần tử là MỘT câu hoàn chỉnh.
			+ Giải thích ngắn gọn từng lỗi (thì, số ít/số nhiều, từ vựng, cấu trúc câu...).
			+ Có thể dùng `backtick` để làm nổi bật từ/cụm từ tiếng Anh hoặc thuật ngữ như `past tense`, `was`, `friends`...
			- summary: 1 đoạn nhận xét ngắn gọn bằng tiếng Việt (1–3 câu) chỉ tổng kết lại các lỗi chính và lời khuyên chung.


			YÊU CẦU QUAN TRỌNG:
			- Nội dung phải phù hợp cho người học tiếng Anh trình độ phổ thông.
			- Không chèn xuống dòng hoặc ký tự lạ bên ngoài cấu trúc JSON.
			- Đảm bảo JSON hợp lệ: không dấu phẩy thừa, escape đúng ký tự đặc biệt.
			""";

        String user =
                """
				Hãy đánh giá bản dịch sau và TRẢ LỜI DUY NHẤT bằng JSON đúng theo schema đã cho.

				Câu gốc (TIẾNG VIỆT):
				\"%s\"

				Bản dịch của người học (TIẾNG ANH):
				\"%s\"

				Nhiệm vụ:
				1. Phân tích các lỗi chính về thì, từ vựng, cấu trúc câu, độ tự nhiên.
				2. Viết lại câu tiếng Anh đã chỉnh sửa vào trường "correction".
				3. Tạo danh sách các gợi ý chi tiết bằng tiếng Việt trong "suggestions".
				4. Viết phần tổng kết ngắn gọn, động viên người học trong "summary".
				5. Gán điểm tổng quan (1–10, có thể số lẻ) vào trường "score".

				CHỈ TRẢ VỀ JSON, KHÔNG THÊM BẤT KỲ NỘI DUNG NÀO BÊN NGOÀI.
				"""
                        .formatted(vietnamese, translate);

        return new PromptMessage(system, user);
    }
}
