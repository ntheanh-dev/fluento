package com.nta.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nta.dto.response.NoteTypeResponse;
import com.nta.entity.Field;
import com.nta.entity.NoteType;
import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.repository.FieldRepository;
import com.nta.repository.NoteTypeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NoteTypeService {

    private final NoteTypeRepository noteTypeRepository;
    private final FieldRepository fieldRepository;


    @Transactional(readOnly = true)
    public List<NoteTypeResponse> getAllNoteTypes() {
        List<NoteType> noteTypes = noteTypeRepository.findAll();
        return noteTypes.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NoteTypeResponse getNoteTypeById(Long noteTypeId) {
        NoteType noteType = noteTypeRepository
                .findById(noteTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTE_TYPE_NOT_FOUND));

        return convertToResponse(noteType);
    }


    private NoteTypeResponse convertToResponse(NoteType noteType) {
        NoteTypeResponse response = new NoteTypeResponse();
        response.setId(noteType.getId());
        response.setName(noteType.getName());

        // Get fields
        List<Field> fields = fieldRepository.findByNoteTypeIdOrderByFieldOrder(noteType.getId());
        response.setFields(fields.stream()
                .map(field -> {
                    NoteTypeResponse.FieldResponse fieldResponse = new NoteTypeResponse.FieldResponse();
                    fieldResponse.setId(field.getId());
                    fieldResponse.setName(field.getName());
                    fieldResponse.setFieldOrder(field.getFieldOrder());
                    fieldResponse.setIsRequired(field.getIsRequired());
                    return fieldResponse;
                })
                .collect(Collectors.toList()));

        // Get note count
        response.setNoteCount(noteTypeRepository.countNotesByNoteTypeId(noteType.getId()));

        return response;
    }
}
