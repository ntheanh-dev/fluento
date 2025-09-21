package com.nta.repository.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "dictionaryApi", url = "https://api.dictionaryapi.dev/api/v2")
public interface DictionaryApiClient {

    @GetMapping("/entries/en/{word}")
    List<DictionaryApiResponse> getWordDefinition(@PathVariable("word") String word);

    class DictionaryApiResponse {
        private String word;
        private String phonetic;
        private List<Phonetic> phonetics;
        private List<Meaning> meanings;

        // Getters and Setters
        public String getWord() {
            return word;
        }

        public void setWord(String word) {
            this.word = word;
        }

        public String getPhonetic() {
            return phonetic;
        }

        public void setPhonetic(String phonetic) {
            this.phonetic = phonetic;
        }

        public List<Phonetic> getPhonetics() {
            return phonetics;
        }

        public void setPhonetics(List<Phonetic> phonetics) {
            this.phonetics = phonetics;
        }

        public List<Meaning> getMeanings() {
            return meanings;
        }

        public void setMeanings(List<Meaning> meanings) {
            this.meanings = meanings;
        }

        public static class Phonetic {
            private String text;
            private String audio;
            private String sourceUrl;
            private License license;

            // Getters and Setters
            public String getText() {
                return text;
            }

            public void setText(String text) {
                this.text = text;
            }

            public String getAudio() {
                return audio;
            }

            public void setAudio(String audio) {
                this.audio = audio;
            }

            public String getSourceUrl() {
                return sourceUrl;
            }

            public void setSourceUrl(String sourceUrl) {
                this.sourceUrl = sourceUrl;
            }

            public License getLicense() {
                return license;
            }

            public void setLicense(License license) {
                this.license = license;
            }
        }

        public static class License {
            private String name;
            private String url;

            // Getters and Setters
            public String getName() {
                return name;
            }

            public void setName(String name) {
                this.name = name;
            }

            public String getUrl() {
                return url;
            }

            public void setUrl(String url) {
                this.url = url;
            }
        }

        public static class Meaning {
            private String partOfSpeech;
            private List<Definition> definitions;

            // Getters and Setters
            public String getPartOfSpeech() {
                return partOfSpeech;
            }

            public void setPartOfSpeech(String partOfSpeech) {
                this.partOfSpeech = partOfSpeech;
            }

            public List<Definition> getDefinitions() {
                return definitions;
            }

            public void setDefinitions(List<Definition> definitions) {
                this.definitions = definitions;
            }
        }

        public static class Definition {
            private String definition;
            private String example;
            private List<String> synonyms;
            private List<String> antonyms;

            // Getters and Setters
            public String getDefinition() {
                return definition;
            }

            public void setDefinition(String definition) {
                this.definition = definition;
            }

            public String getExample() {
                return example;
            }

            public void setExample(String example) {
                this.example = example;
            }

            public List<String> getSynonyms() {
                return synonyms;
            }

            public void setSynonyms(List<String> synonyms) {
                this.synonyms = synonyms;
            }

            public List<String> getAntonyms() {
                return antonyms;
            }

            public void setAntonyms(List<String> antonyms) {
                this.antonyms = antonyms;
            }
        }
    }
}
