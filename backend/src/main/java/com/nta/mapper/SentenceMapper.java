package com.nta.mapper;

import org.mapstruct.Mapper;

import com.nta.dto.request.SentenceCreationRequest;
import com.nta.entity.Sentence;

@Mapper(componentModel = "spring")
public interface SentenceMapper {
    Sentence toSentence(SentenceCreationRequest sentenceCreationRequest);
}
