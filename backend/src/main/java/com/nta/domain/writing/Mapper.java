package com.nta.domain.writing;

import com.nta.domain.writing.dto.response.WritingResponse;

@org.mapstruct.Mapper(componentModel = "spring", implementationName = "WritingMapperImpl")
public interface Mapper {
    WritingResponse toWritingResponse(Writing writing);
}
