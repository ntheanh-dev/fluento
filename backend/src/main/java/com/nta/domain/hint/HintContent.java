package com.nta.domain.hint;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HintContent {
    private List<VocabularyHint> vocabularyHints;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VocabularyHint {
        private String vietnamese;
        private List<Vocobulary> english;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Vocobulary {
        private String english;
        private String partsOfSpeech;
        private String ipaPronunciation;
    }

    // Structure-related hints (sentence types, tenses, etc.) have been removed.
}
// example
/*
{
// Danh sách gợi ý từ vựng
"vocabularyHints": [
	{
	"vietnamese": "cuộc sống đại học",   // tiếng Việt
	"english": ["university life"]       // các cách dịch sang tiếng Anh
	},
	{
	"vietnamese": "mặc dù",
	"english": ["although"]
	},
	{
	"vietnamese": "đầy thử thách",
	"english": ["full of challenges", "challenging"]
	},
	{
	"vietnamese": "mang đến",
	"english": ["offers", "provides"]
	},
	{
	"vietnamese": "vô giá",
	"english": ["invaluable"]
	},
	{
	"vietnamese": "cơ hội",
	"english": ["opportunities"]
	},
	{
	"vietnamese": "phát triển bản thân",
	"english": ["self-development", "personal growth"]
	},
	{
	"vietnamese": "cho sinh viên",
	"english": ["for students"]
	}
],

// Gợi ý về cấu trúc ngữ pháp
"structureHints": {
	// Loại câu theo cấu trúc
	"kindsOfSentencesAccordingToStructure": {
	"vietnamese": "Câu phức",
	"english": "complex sentences"
	},

	// Thì được dùng
	"tenses": {
	"vietnamese": "Thì hiện tại đơn",
	"english": "simple present",
	"form": "S + V + O"   // công thức câu
	}
}
}
*/
