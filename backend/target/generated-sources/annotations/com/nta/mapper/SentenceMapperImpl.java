package com.nta.mapper;

import com.nta.dto.request.SentenceCreationRequest;
import com.nta.entity.Sentence;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.6 (Oracle Corporation)"
)
@Component
public class SentenceMapperImpl implements SentenceMapper {

    @Override
    public Sentence toSentence(SentenceCreationRequest sentenceCreationRequest) {
        if ( sentenceCreationRequest == null ) {
            return null;
        }

        Sentence.SentenceBuilder sentence = Sentence.builder();

        sentence.vietnamese( sentenceCreationRequest.getVietnamese() );
        sentence.englishTranslation( sentenceCreationRequest.getEnglishTranslation() );
        sentence.orderIndex( sentenceCreationRequest.getOrderIndex() );
        sentence.score( sentenceCreationRequest.getScore() );
        sentence.feedback( sentenceCreationRequest.getFeedback() );

        return sentence.build();
    }
}
