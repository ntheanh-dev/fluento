package com.nta.mapper;

import com.nta.dto.response.WritingResponse;
import com.nta.entity.Writing;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WritingMapper {
    WritingResponse toWritingResponse(Writing writing);
}
