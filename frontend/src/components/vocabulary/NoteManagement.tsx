import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    CircularProgress
} from '@mui/material';
import { type Deck, type NoteType, type Note, type CreateNoteRequest } from './vocabulary';
import { vocabularyDeckApi, vocabularyNoteTypeApi, vocabularyNoteApi, type PaginatedResponse, type PaginationParams } from './vocabularyApi';
import { notify } from '../../utils/notify';
import { showOverlay, hideOverlay } from '../../utils/overlay';
import { VocabularyCache } from '../../utils/cache';
import { Breadcrumb, NotesTable, NoteDialog } from './notemanagement/index';


const NoteManagement: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { deckId: urlDeckId } = useParams<{ deckId?: string }>();
    const navigate = useNavigate();

    const [decks, setDecks] = useState<Deck[]>([]);
    const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
    const [loading, setLoading] = useState(true);

    // Pagination state - initialize from URL params
    const [paginationData, setPaginationData] = useState<PaginatedResponse<Note> | null>(null);
    const page = parseInt(searchParams.get('page') || '0');
    const rowsPerPage = parseInt(searchParams.get('size') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc';

    const [openDialog, setOpenDialog] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [formData, setFormData] = useState<CreateNoteRequest>({
        noteTypeId: 0, // Will be updated when noteTypes are loaded
        deckId: 0,
        fieldValues: {},
    });
    const [autoFillLoading, setAutoFillLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
    const loadedDeckRef = useRef<number | null>(null);

    // Handle file change for image fields
    const handleFileChange = (fieldName: string, file: File | null) => {
        const newFieldValues = { ...formData.fieldValues };
        const newImageUrls = { ...imageUrls };

        if (file) {
            newFieldValues[fieldName] = file;
            // Remove the existing image URL when user selects a new file
            delete newImageUrls[fieldName];
        } else {
            delete newFieldValues[fieldName];
            // Remove the image URL when user removes the image
            delete newImageUrls[fieldName];
        }

        setFormData({
            ...formData,
            fieldValues: newFieldValues
        });
        setImageUrls(newImageUrls);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Update formData with first noteType when noteTypes are loaded
    useEffect(() => {
        if (noteTypes.length > 0 && formData.noteTypeId === 0) {
            setFormData(prev => ({
                ...prev,
                noteTypeId: noteTypes[0].id
            }));
        }
    }, [noteTypes]);

    // Load notes from URL params when component mounts or URL changes
    useEffect(() => {
        if (decks.length > 0) {
            // Priority: URL path param > search param > first deck
            const deckIdFromUrl = urlDeckId || searchParams.get('deckId');
            let selectedDeck: Deck | null = null;


            if (deckIdFromUrl) {
                // Try to find deck from URL params
                selectedDeck = decks.find(d => d.id === parseInt(deckIdFromUrl)) || null;
            }

            // If no deck from URL or deck not found, select first deck
            if (!selectedDeck) {
                selectedDeck = decks[0];
            }

            if (selectedDeck && loadedDeckRef.current !== selectedDeck.id) {
                loadedDeckRef.current = selectedDeck.id;
                setSelectedDeck(selectedDeck);
                loadNotesForDeck(selectedDeck.id, page, rowsPerPage, sortBy, sortDir);
            }
        }
    }, [decks, searchParams, urlDeckId]);


    const loadData = async () => {
        try {
            setLoading(true);

            // Try to load noteTypes from cache first
            const cachedNoteTypes = VocabularyCache.getNoteTypes() as NoteType[] | null;
            let noteTypesData: NoteType[] = cachedNoteTypes || [];


            // Fetch fresh data in parallel
            const [freshDecksData, freshNoteTypesData] = await Promise.all([
                vocabularyDeckApi.getUserDecks(),
                vocabularyNoteTypeApi.getUserNoteTypes()
            ]);

            // Always use fresh decks data (no caching)
            setDecks(freshDecksData);

            // Handle noteTypes cache
            if (noteTypesData.length === 0) {
                noteTypesData = freshNoteTypesData;
                VocabularyCache.setNoteTypes(noteTypesData);
            } else {
                // Compare cached data with fresh data to detect changes
                const cachedIds = noteTypesData.map(nt => nt.id).sort();
                const freshIds = freshNoteTypesData.map(nt => nt.id).sort();

                if (JSON.stringify(cachedIds) !== JSON.stringify(freshIds)) {
                    // Data has changed, update cache
                    noteTypesData = freshNoteTypesData;
                    VocabularyCache.setNoteTypes(noteTypesData);
                }
            }

            setNoteTypes(noteTypesData);
        } catch (error) {
            notify('Lỗi khi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadNotesForDeck = async (deckId: number, pageNum: number = page, size: number = rowsPerPage, sort: string = sortBy, dir: 'asc' | 'desc' = sortDir) => {
        try {
            showOverlay({ message: 'Đang tải notes...' });

            // Only navigate if we're not already on the correct URL
            const currentUrl = window.location.pathname;
            const targetUrl = `/vocabulary/decks/${deckId}`;

            if (currentUrl !== targetUrl) {
                // Update URL path and params
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('page', pageNum.toString());
                newSearchParams.set('size', size.toString());
                newSearchParams.set('sortBy', sort);
                newSearchParams.set('sortDir', dir);

                // Navigate to deck-specific URL
                const newUrl = `${targetUrl}?${newSearchParams.toString()}`;
                navigate(newUrl, { replace: true });
            }

            const params: PaginationParams = {
                page: pageNum,
                size: size,
                sortBy: sort,
                sortDir: dir
            };
            const paginatedData = await vocabularyNoteApi.getNotesByDeckPaginated(deckId, params);
            setPaginationData(paginatedData);
            setNotes(paginatedData.content);
        } catch (error) {
            notify('Lỗi khi tải notes', 'error');
        } finally {
            hideOverlay();
        }
    };


    // Pagination handlers
    const handleChangePage = async (_event: unknown, newPage: number) => {
        if (selectedDeck) {
            await loadNotesForDeck(selectedDeck.id, newPage, rowsPerPage, sortBy, sortDir);
        }
    };

    const handleChangeRowsPerPage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(event.target.value, 10);
        if (selectedDeck) {
            await loadNotesForDeck(selectedDeck.id, 0, newSize, sortBy, sortDir);
        }
    };

    const handleSort = async (property: string) => {
        const isAsc = sortBy === property && sortDir === 'asc';
        const newSortDir = isAsc ? 'desc' : 'asc';
        if (selectedDeck) {
            await loadNotesForDeck(selectedDeck.id, 0, rowsPerPage, property, newSortDir);
        }
    };

    const handleOpenDialog = (note?: Note) => {
        if (note) {
            setEditingNote(note);

            // Separate image URLs from other field values
            const textFields: Record<string, string> = {};
            const imageFields: Record<string, string> = {};

            Object.entries(note.fieldValues).forEach(([key, value]) => {
                if (typeof value === 'string' && (value.includes('res.cloudinary.com') || value.includes('http'))) {
                    // This is likely an image URL
                    imageFields[key] = value;
                } else if (typeof value === 'string') {
                    // This is a text field
                    textFields[key] = value;
                }
            });

            setFormData({
                noteTypeId: note.noteTypeId,
                deckId: note.deckId,
                fieldValues: textFields
            });
            setImageUrls(imageFields);
        } else {
            setEditingNote(null);
            setFormData({
                noteTypeId: noteTypes.length > 0 ? noteTypes[0].id : 0,
                deckId: selectedDeck?.id || 0,
                fieldValues: {}
            });
            setImageUrls({});
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingNote(null);
        setFormData({
            noteTypeId: noteTypes.length > 0 ? noteTypes[0].id : 0,
            deckId: 0,
            fieldValues: {}
        });
        setImageUrls({});
    };

    const handleSave = async () => {
        try {
            showOverlay({ message: editingNote ? 'Đang cập nhật note...' : 'Đang tạo note...' });

            // Merge text fields and image URLs/files
            const mergedFieldValues = { ...formData.fieldValues };

            // Add image URLs from existing images
            Object.entries(imageUrls).forEach(([key, url]) => {
                mergedFieldValues[key] = url;
            });

            // Add new image files
            Object.entries(formData.fieldValues).forEach(([key, value]) => {
                if (value instanceof File) {
                    mergedFieldValues[key] = value;
                }
            });

            const dataToSave = {
                ...formData,
                fieldValues: mergedFieldValues
            };

            if (editingNote) {
                await vocabularyNoteApi.updateNote(editingNote.id, dataToSave);
                notify('Cập nhật note thành công', 'success');
            } else {
                await vocabularyNoteApi.createNote(dataToSave);
                notify('Tạo note thành công', 'success');
            }
            handleCloseDialog();
            if (selectedDeck) {
                await loadNotesForDeck(selectedDeck.id, page, rowsPerPage, sortBy, sortDir);
            }
        } catch (error) {
            notify('Lỗi khi lưu note', 'error');
        } finally {
            hideOverlay();
        }
    };

    const handleAutoFillLoading = (loading: boolean) => {
        setAutoFillLoading(loading);
    };

    const handleDelete = async (note: Note) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa note này?')) {
            try {
                showOverlay({ message: 'Đang xóa note...' });
                await vocabularyNoteApi.deleteNote(note.id);
                notify('Xóa note thành công', 'success');
                if (selectedDeck) {
                    await loadNotesForDeck(selectedDeck.id, page, rowsPerPage, sortBy, sortDir);
                }
            } catch (error) {
                notify('Lỗi khi xóa note', 'error');
            } finally {
                hideOverlay();
            }
        }
    };


    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Breadcrumb selectedDeck={selectedDeck} />

            <NotesTable
                notes={notes}
                selectedDeck={selectedDeck}
                paginationData={paginationData}
                searchParams={searchParams}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                onSort={handleSort}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                onAddNote={() => handleOpenDialog()}
            />

            <NoteDialog
                open={openDialog}
                editingNote={editingNote}
                noteTypes={noteTypes}
                formData={formData}
                imageUrls={imageUrls}
                autoFillLoading={autoFillLoading}
                onClose={handleCloseDialog}
                onSave={handleSave}
                onFormDataChange={setFormData}
                onImageUrlsChange={setImageUrls}
                onFileChange={handleFileChange}
                onAutoFillLoadingChange={handleAutoFillLoading}
            />
        </Box>
    );
};

export default NoteManagement;