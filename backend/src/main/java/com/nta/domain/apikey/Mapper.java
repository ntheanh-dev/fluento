package com.nta.domain.apikey;

import com.nta.domain.apikey.dto.response.AiModelResponse;

@org.mapstruct.Mapper(componentModel = "spring", implementationName = "ApiKeyMapperImpl")
public interface Mapper {

    AiModelResponse toAiModelResponse(ApiKey entity);
}
