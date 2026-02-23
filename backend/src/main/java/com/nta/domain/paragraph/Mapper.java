package com.nta.domain.paragraph;

import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;

@org.mapstruct.Mapper(componentModel = "spring", implementationName = "ParagraphMapperImpl")
public interface Mapper {
    Paragraph toParagraph(CreateParagraphRequest request);
}
