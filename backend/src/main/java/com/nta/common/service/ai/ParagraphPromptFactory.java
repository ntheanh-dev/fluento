package com.nta.common.service.ai;

import org.springframework.stereotype.Component;

import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.paragraph.enums.SentenceCount;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ParagraphPromptFactory {

    public PromptMessage buildPrompt(CreateParagraphRequest request) {

        return switch (request.getType()) {
            case BASIC -> buildBasicPrompt(request);
            case STORY, EMAIL, IELTS_TASK1, IELTS_TASK2 -> buildWritingPrompt(request);
            case SINGLE_SENTENCE -> buildSingleSentencePrompt(request);
        };
    }

    private PromptMessage buildBasicPrompt(CreateParagraphRequest request) {

        String system =
                "You are an expert language learning assistant specializing in creating educational content for Vietnamese learners studying English. "
                        + "Your task is to generate well-structured, coherent paragraphs that help learners practice reading and translation skills. "
                        + "Always ensure the content is culturally appropriate, engaging, and educational. "
                        + "The paragraphs should flow naturally and contain vocabulary appropriate for the specified language proficiency level.";

        int sentenceCount =
                request.getSentenceCount() != null ? request.getSentenceCount().getSize() : SentenceCount.TEN.getSize();

        String user = String.format(
                "Create a well-structured paragraph in vietnamese with around %d sentences about the topic '%s'. "
                        + "Requirements:\n"
                        + "- Use vocabulary and grammar appropriate for %s proficiency level\n"
                        + "- Maintain a %s tone throughout the text\n"
                        + "- Ensure sentences are connected logically with appropriate transitions\n"
                        + "- Make the content engaging and educational for Vietnamese learners\n"
                        + "- Focus on practical, real-world applications of the topic\n"
                        + "- Output ONLY the paragraph content.\n"
                        + "- Do NOT include any introduction, explanation, or extra commentary.\n"
                        + "- Return plain text only.\n"
                        + "- Use varied sentence structures to enhance learning value\n\n"
                        + "Topic: %s\nLanguage: vietnamese\nLevel: %s\nTone: %s\nSentences: %d",
                sentenceCount,
                request.getTopic(),
                request.getLevel(),
                request.getTone(),
                request.getTopic(),
                request.getLevel(),
                request.getTone(),
                sentenceCount);

        return new PromptMessage(system, user);
    }

    private PromptMessage buildWritingPrompt(CreateParagraphRequest request) {
        String system = "You are an expert English-learning content creator. "
                + "Your task is to generate Vietnamese content specifically designed "
                + "for learners to translate into English. "
                + "The content must include sentence structures, grammar patterns, "
                + "and vocabulary that are useful for English translation practice. "
                + "The difficulty must match the specified proficiency level. "
                + "Generate a suitable title and matching content. "
                + "Return ONLY valid JSON with this schema: "
                + "{\"title\":\"string\",\"content\":\"string\"}";

        int sentenceCount =
                request.getSentenceCount() != null ? request.getSentenceCount().getSize() : SentenceCount.TEN.getSize();

        String typeInstruction =
                switch (request.getType()) {
                    case EMAIL -> """
						Write in proper email format:
						- Include greeting
						- Clear body paragraphs
						- Proper closing
						- Semi-formal or formal tone depending on topic
						""";

                    case STORY -> """
						Write as a short story:
						- Clear beginning, middle, and ending
						- Include characters and events
						- Natural narrative flow
						""";

                    case IELTS_TASK1 -> """
						Write in IELTS Task 1 style:
						- Clear introduction
						- Body paragraphs with arguments/examples
						- Logical conclusion
						- Academic tone
						""";
                    case IELTS_TASK2 -> """
							Write in IELTS Task 2 style:
							- Clear introduction
							- Body paragraphs with arguments/examples
							- Logical conclusion
							- Academic tone
							""";

                    default -> """
						Write as a coherent structured paragraph
						with logical flow and transitions.
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
        String system =
                """
				You are an expert English teacher creating learning materials for Vietnamese learners.
				Your task is to generate Vietnamese sentences that students will translate into English.
				Sentences must be natural, grammatically correct, and appropriate for the given English level.
				Only output the sentences with no explanations.
				""";

        String user = String.format(
                """
				Generate about %d Vietnamese sentences for English translation practice.

				Topic: %s
				English level: %s
				Tone: %s

				Requirements:
				- Use a variety of sentence types:
				* statements
				* questions
				* exclamations
				* requests
				* suggestions
				- Sentences should feel natural in daily life
				- Keep vocabulary suitable for the specified level
				- Each sentence must be on a new line
				- Do NOT include numbering, bullet points, or explanations
				""",
                request.getSentenceCount().getSize(), request.getTopic(), request.getLevel(), request.getTone());

        return new PromptMessage(system, user);
    }

    public PromptMessage buildHintTranslationPrompt(String sentence, String level) {
        final String system =
                "You are an expert English learning assistant specializing in helping Vietnamese learners understand vocabulary. "
                        + "Your role is to provide comprehensive, educational hints that help learners translate Vietnamese sentences to English effectively. "
                        + "You must return ONLY valid JSON with no additional text, markdown, or explanations outside the JSON structure. "
                        + "Be precise, educational, and focus on practical learning insights.\n\n"
                        + "IMPORTANT: Generate vocabulary hints appropriate for " + level + " level proficiency. "
                        + "Choose English translations that match the vocabulary complexity expected at " + level
                        + " level:\n"
                        + "- A2: Basic vocabulary, simple words and common expressions\n"
                        + "- B1: Intermediate vocabulary, familiar topics and everyday situations\n"
                        + "- B2: Upper-intermediate vocabulary, abstract concepts and complex ideas\n"
                        + "- C1: Advanced vocabulary, sophisticated language and nuanced expressions\n"
                        + "- C2: Proficient vocabulary, complex academic and professional terms\n\n"
                        + "JSON Schema (use EXACTLY these property names in camelCase):\n"
                        + "{\n"
                        + "  \"vocabularyHints\": [\n"
                        + "    { \"vietnamese\": \"word/phrase\", \"english\": [{\"english\": \"translation1\", \"partsOfSpeech\": \"part of speech\", \"ipaPronunciation\": \"ipa pronunciation\"}, {\"english\": \"translation2\", \"partsOfSpeech\": \"part of speech\", \"ipaPronunciation\": \"ipa pronunciation\"}] }\n"
                        + "  ]\n"
                        + "}\n\n"
                        + "Detailed Requirements:\n"
                        + "- vocabularyHints: Extract ALL key words/phrases with their most appropriate English translations for "
                        + level + " level. Include multiple translations when relevant.\n"
                        + "- Provide educational value by choosing translations that help learners understand context and usage appropriate for "
                        + level + " level.\n"
                        + "- Maintain JSON validity - no trailing commas, proper escaping, exact property names.";

        String user = String.format(
                "Analyze the Vietnamese sentence below and provide comprehensive learning hints in the specified JSON format for %s level proficiency.\n\n"
                        + "Vietnamese sentence: \"%s\"\n\n"
                        + "Tasks:\n"
                        + "1. Extract key vocabulary with appropriate English translations suitable for %s level\n"
                        + "2. Identify the sentence structure type in both languages\n"
                        + "3. Determine the main tense/aspect with grammatical pattern\n"
                        + "4. Ensure all hints support effective Vietnamese-to-English translation learning at %s level\n\n"
                        + "Return only the JSON response with exact property names as specified.",
                level, sentence, level, level);

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
			"correction": "string",
			"improved": "string",
			"suggestions": ["string", "string"],
			"summary": "string",
			"score": 0.0
			}

			DIỄN GIẢI CHI TIẾT:
			- correction: Câu tiếng Anh đã CHỈNH SỬA, dạng gợi ý tổng quát giống như phần "Suggestion".
			+ Viết lại toàn bộ câu theo bản dịch đúng và tự nhiên hơn.
			- improved: Câu tiếng Anh dùng từ ngữ, cấu trúc, thì, từ vựng tốt hơn.
			- suggestions: Danh sách 2–5 gợi ý chi tiết bằng tiếng Việt, mỗi phần tử là MỘT câu hoàn chỉnh.
			+ Giải thích ngắn gọn từng lỗi (thì, số ít/số nhiều, từ vựng, cấu trúc câu...).
			+ Có thể dùng `backtick` để làm nổi bật từ/cụm từ tiếng Anh hoặc thuật ngữ như `past tense`, `was`, `friends`...
			- summary: 1 đoạn nhận xét ngắn gọn bằng tiếng Việt (1–3 câu) tổng kết các lỗi chính và lời khuyên chung.
			- score: Điểm số tổng quan từ 1–10 (số thực, ví dụ 7.5) đánh giá chất lượng câu dịch.

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
