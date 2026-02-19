package com.nta.domain.sentence;

import com.nta.domain.sentence.dto.request.SentenceCreationRequest;

@org.mapstruct.Mapper(componentModel = "spring", implementationName = "SentenceMapperImpl")
public interface Mapper {
    Sentence toSentence(SentenceCreationRequest sentenceCreationRequest);
}
