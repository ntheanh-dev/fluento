package com.nta.mapper;

import com.nta.dto.request.SentenceCreationRequest;
import com.nta.entity.Sentence;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SentenceMapper {
    Sentence toSentence(SentenceCreationRequest sentenceCreationRequest);
}
