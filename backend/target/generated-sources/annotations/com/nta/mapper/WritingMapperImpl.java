package com.nta.mapper;

import com.nta.dto.response.WritingResponse;
import com.nta.entity.Sentence;
import com.nta.entity.Writing;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.6 (Oracle Corporation)"
)
@Component
public class WritingMapperImpl implements WritingMapper {

    @Override
    public WritingResponse toWritingResponse(Writing writing) {
        if ( writing == null ) {
            return null;
        }

        WritingResponse.WritingResponseBuilder writingResponse = WritingResponse.builder();

        List<Sentence> list = writing.getEnglishSentences();
        if ( list != null ) {
            writingResponse.englishSentences( new ArrayList<Sentence>( list ) );
        }
        writingResponse.id( writing.getId() );
        writingResponse.conversationId( writing.getConversationId() );
        writingResponse.topic( writing.getTopic() );
        writingResponse.level( writing.getLevel() );
        writingResponse.tone( writing.getTone() );
        writingResponse.sentenceCount( writing.getSentenceCount() );
        writingResponse.createdAt( writing.getCreatedAt() );
        writingResponse.updatedAt( writing.getUpdatedAt() );

        return writingResponse.build();
    }
}
