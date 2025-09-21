import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box
} from '@mui/material';
import { type Note, type NoteType, type CreateNoteRequest } from '../vocabulary';
import NoteForm from './NoteForm';

interface NoteDialogProps {
    open: boolean;
    editingNote: Note | null;
    noteTypes: NoteType[];
    formData: CreateNoteRequest;
    imageUrls: Record<string, string>;
    autoFillLoading: boolean;
    onClose: () => void;
    onSave: () => void;
    onFormDataChange: (data: CreateNoteRequest) => void;
    onImageUrlsChange: (urls: Record<string, string>) => void;
    onFileChange: (fieldName: string, file: File | null) => void;
    onAutoFillLoadingChange: (loading: boolean) => void;
}

const NoteDialog: React.FC<NoteDialogProps> = ({
    open,
    editingNote,
    noteTypes,
    formData,
    imageUrls,
    autoFillLoading,
    onClose,
    onSave,
    onFormDataChange,
    onImageUrlsChange,
    onFileChange,
    onAutoFillLoadingChange
}) => {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showValidationErrors, setShowValidationErrors] = useState(false);

    // Helper function to detect image fields
    const isImageField = (fieldName: string): boolean => {
        const imageKeywords = ['image', 'hình ảnh', 'picture', 'photo', 'img'];
        return imageKeywords.some(keyword =>
            fieldName.toLowerCase().includes(keyword)
        );
    };

    // Validation function
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        const currentNoteType = noteTypes.find(nt => nt.id === formData.noteTypeId);

        if (!currentNoteType) {
            errors.noteType = 'Vui lòng chọn loại note';
        }

        if (currentNoteType) {
            currentNoteType.fields.forEach(field => {
                if (field.isRequired) {
                    const fieldValue = formData.fieldValues[field.name];
                    const imageValue = imageUrls[field.name];

                    // Check if field is empty
                    if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
                        // For image fields, also check if there's an existing image URL
                        if (isImageField(field.name)) {
                            if (!imageValue) {
                                errors[field.name] = `${field.name} là bắt buộc`;
                            }
                        } else {
                            errors[field.name] = `${field.name} là bắt buộc`;
                        }
                    }
                }
            });
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Clear validation errors when dialog opens/closes
    useEffect(() => {
        if (open) {
            setValidationErrors({});
            setShowValidationErrors(false);
        }
    }, [open]);

    // Clear validation errors when form data changes
    useEffect(() => {
        if (showValidationErrors) {
            // Re-validate when form data changes
            validateForm();
        }
    }, [formData, imageUrls, showValidationErrors]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {editingNote ? 'Sửa Note' : 'Thêm Note Mới'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <NoteForm
                        noteTypes={noteTypes}
                        formData={formData}
                        imageUrls={imageUrls}
                        autoFillLoading={autoFillLoading}
                        validationErrors={validationErrors}
                        showValidationErrors={showValidationErrors}
                        showRequiredFieldsInfo={true}
                        compactMode={false}
                        onFormDataChange={onFormDataChange}
                        onImageUrlsChange={onImageUrlsChange}
                        onFileChange={onFileChange}
                        onAutoFillLoadingChange={onAutoFillLoadingChange}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    Hủy
                </Button>
                <Button
                    onClick={() => {
                        setShowValidationErrors(true);
                        if (validateForm()) {
                            onSave();
                        }
                    }}
                    variant="contained"
                    disabled={formData.noteTypeId === 0}
                >
                    {editingNote ? 'Cập nhật' : 'Tạo'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NoteDialog;
