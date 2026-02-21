package com.nta.domain.apikey;

import org.mapstruct.Mapping;

import com.nta.domain.apikey.dto.response.AiModelResponse;

@org.mapstruct.Mapper(componentModel = "spring", implementationName = "ApiKeyMapperImpl")
public interface Mapper {

    @Mapping(
            target = "limitPerDay",
            expression = "java(entity.getLimitPerDay() != null ? entity.getLimitPerDay().getMaxRequests() : null)")
    AiModelResponse toAiModelResponse(ApiKey entity);
}
