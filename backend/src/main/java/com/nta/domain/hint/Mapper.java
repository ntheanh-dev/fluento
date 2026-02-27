package com.nta.domain.hint;

@org.mapstruct.Mapper(componentModel = "spring", implementationName = "HintMapperImpl")
public interface Mapper {
    HintContent toHintTranslationResponse(Hint hint);
}
