package com.nta.mapper;

import org.mapstruct.Mapper;

import com.nta.dto.response.WritingResponse;
import com.nta.entity.Writing;

@Mapper(componentModel = "spring")
public interface WritingMapper {
    WritingResponse toWritingResponse(Writing writing);
}
