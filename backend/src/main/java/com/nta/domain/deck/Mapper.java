package com.nta.domain.deck;

import java.util.List;
import java.util.Set;

import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.nta.domain.deck.dto.response.DeckResponse;
import com.nta.domain.vocabulary.Vocabulary;

@org.mapstruct.Mapper(componentModel = "spring", implementationName = "DeckMapperImpl")
public interface Mapper {
    @Mapping(target = "vocabularyCount", source = "vocabularies", qualifiedByName = "toVocabularyCount")
    DeckResponse toDeckResponse(Deck deck);

    List<DeckResponse> toDeckResponses(List<Deck> decks);

    @Named("toVocabularyCount")
    default Integer toVocabularyCount(Set<Vocabulary> vocabularies) {
        return vocabularies == null ? 0 : vocabularies.size();
    }
}
