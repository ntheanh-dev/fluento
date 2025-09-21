package com.nta.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nta.dto.request.CreateNoteTypeRequest;
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

    public NoteTypeResponse createNoteType(CreateNoteTypeRequest request) {
        // Check if note type name already exists globally
        if (noteTypeRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.NOTE_TYPE_NAME_EXISTS);
        }

        NoteType noteType = new NoteType();
        noteType.setName(request.getName());

        NoteType savedNoteType = noteTypeRepository.save(noteType);

        // Create fields
        if (request.getFields() != null && !request.getFields().isEmpty()) {
            for (CreateNoteTypeRequest.FieldRequest fieldRequest : request.getFields()) {
                Field field = new Field();
                field.setName(fieldRequest.getName());
                field.setNoteTypeId(savedNoteType.getId());
                field.setFieldOrder(fieldRequest.getFieldOrder());
                field.setIsRequired(fieldRequest.getIsRequired());
                fieldRepository.save(field);
            }
        }

        return convertToResponse(savedNoteType);
    }

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

    public NoteTypeResponse updateNoteType(Long noteTypeId, CreateNoteTypeRequest request) {
        NoteType noteType = noteTypeRepository
                .findById(noteTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTE_TYPE_NOT_FOUND));

        // Check if new name conflicts with existing note type
        if (!noteType.getName().equals(request.getName())) {
            if (noteTypeRepository.findByName(request.getName()).isPresent()) {
                throw new AppException(ErrorCode.NOTE_TYPE_NAME_EXISTS);
            }
        }

        noteType.setName(request.getName());

        NoteType updatedNoteType = noteTypeRepository.save(noteType);

        // Update fields (delete existing and create new ones)
        List<Field> existingFields = fieldRepository.findByNoteTypeIdOrderByFieldOrder(noteTypeId);
        fieldRepository.deleteAll(existingFields);

        if (request.getFields() != null && !request.getFields().isEmpty()) {
            for (CreateNoteTypeRequest.FieldRequest fieldRequest : request.getFields()) {
                Field field = new Field();
                field.setName(fieldRequest.getName());
                field.setNoteTypeId(updatedNoteType.getId());
                field.setFieldOrder(fieldRequest.getFieldOrder());
                field.setIsRequired(fieldRequest.getIsRequired());
                fieldRepository.save(field);
            }
        }

        return convertToResponse(updatedNoteType);
    }

    public void deleteNoteType(Long noteTypeId) {
        NoteType noteType = noteTypeRepository
                .findById(noteTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTE_TYPE_NOT_FOUND));

        noteTypeRepository.delete(noteType);
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
