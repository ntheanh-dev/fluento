import { api } from '../../configs/API';
import { type ApiResponse } from '../../types/api';
import { 
  type Deck, 
  type NoteType, 
  type Note, 
  type Card, 
  type StudySession,
  type StudyModeStats,
  type CreateDeckRequest,
  type CreateNoteTypeRequest,
  type CreateNoteRequest,
  type ReviewCardRequest
} from './vocabulary';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface PaginationParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

// Vocabulary Deck API
export const vocabularyDeckApi = {
  // Create a new deck
  createDeck: async (data: CreateDeckRequest): Promise<Deck> => {
    const response = await api.post<ApiResponse<Deck>>('/decks', data);
    return response.data.result;
  },

  // Get user's decks
  getUserDecks: async (): Promise<Deck[]> => {
    const response = await api.get<ApiResponse<Deck[]>>('/decks');
    return response.data.result || [];
  },

  // Get user's decks with pagination
  getUserDecksPaginated: async (params: PaginationParams): Promise<PaginatedResponse<Deck>> => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
      sortBy: params.sortBy,
      sortDir: params.sortDir
    });
    const response = await api.get<ApiResponse<PaginatedResponse<Deck>>>(`/decks/paginated?${queryParams}`);
    return response.data.result;
  },

  // Get public decks
  getPublicDecks: async (): Promise<Deck[]> => {
    const response = await api.get<ApiResponse<Deck[]>>('/decks/public');
    return response.data.result || [];
  },

  // Get deck by ID
  getDeckById: async (deckId: number): Promise<Deck> => {
    const response = await api.get<ApiResponse<Deck>>(`/decks/${deckId}`);
    return response.data.result;
  },

  // Update deck
  updateDeck: async (deckId: number, data: CreateDeckRequest): Promise<Deck> => {
    const response = await api.put<ApiResponse<Deck>>(`/decks/${deckId}`, data);
    return response.data.result;
  },

  // Delete deck
  deleteDeck: async (deckId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/decks/${deckId}`);
  },
};

// Vocabulary Note Type API
export const vocabularyNoteTypeApi = {
  // Create a new note type
  createNoteType: async (data: CreateNoteTypeRequest): Promise<NoteType> => {
    const response = await api.post<ApiResponse<NoteType>>('/note-types', data);
    return response.data.result;
  },

  // Get user's note types
  getUserNoteTypes: async (): Promise<NoteType[]> => {
    const response = await api.get<ApiResponse<NoteType[]>>('/note-types');
    return response.data.result || [];
  },

  // Get note type by ID
  getNoteTypeById: async (noteTypeId: number): Promise<NoteType> => {
    const response = await api.get<ApiResponse<NoteType>>(`/note-types/${noteTypeId}`);
    return response.data.result;
  },

  // Update note type
  updateNoteType: async (noteTypeId: number, data: CreateNoteTypeRequest): Promise<NoteType> => {
    const response = await api.put<ApiResponse<NoteType>>(`/note-types/${noteTypeId}`, data);
    return response.data.result;
  },

  // Delete note type
  deleteNoteType: async (noteTypeId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/note-types/${noteTypeId}`);
  },
};

// Vocabulary Note API
export const vocabularyNoteApi = {
  // Create a new note
  createNote: async (data: CreateNoteRequest): Promise<Note> => {
    // Check if there are any File objects in fieldValues
    const hasFiles = Object.values(data.fieldValues).some(value => value instanceof File);
    
    if (hasFiles) {
      // Use FormData for multipart upload
      const formData = new FormData();
      formData.append('noteTypeId', data.noteTypeId.toString());
      formData.append('deckId', data.deckId.toString());
      
      // Separate text and file fields
      const textFields: Record<string, string> = {};
      const fileFields: Record<string, string> = {};
      
      Object.entries(data.fieldValues).forEach(([key, value]) => {
        if (value instanceof File) {
          fileFields[key] = value.name; // Store filename for mapping
          formData.append('files', value);
        } else {
          textFields[key] = value as string;
        }
      });
      
      formData.append('fieldValues', JSON.stringify(textFields));
      formData.append('fileFields', JSON.stringify(fileFields));
      
      const response = await api.post<ApiResponse<Note>>('/notes/with-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.result;
    } else {
      // Use regular JSON for text-only notes
      const response = await api.post<ApiResponse<Note>>('/notes', data);
      return response.data.result;
    }
  },

  // Get notes by deck
  getNotesByDeck: async (deckId: number): Promise<Note[]> => {
    const response = await api.get<ApiResponse<Note[]>>(`/notes/deck/${deckId}`);
    return response.data.result || [];
  },

  // Get notes by deck with pagination
  getNotesByDeckPaginated: async (deckId: number, params: PaginationParams): Promise<PaginatedResponse<Note>> => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
      sortBy: params.sortBy,
      sortDir: params.sortDir
    });
    const response = await api.get<ApiResponse<PaginatedResponse<Note>>>(`/notes/deck/${deckId}/paginated?${queryParams}`);
    return response.data.result;
  },

  // Get note by ID
  getNoteById: async (noteId: number): Promise<Note> => {
    const response = await api.get<ApiResponse<Note>>(`/notes/${noteId}`);
    return response.data.result;
  },

  // Update note
  updateNote: async (noteId: number, data: CreateNoteRequest): Promise<Note> => {
    const response = await api.put<ApiResponse<Note>>(`/notes/${noteId}`, data);
    return response.data.result;
  },

  // Delete note
  deleteNote: async (noteId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/notes/${noteId}`);
  },
};

// Vocabulary Study API
export const vocabularyStudyApi = {
  // Get study session
  getStudySession: async (studyMode?: string, deckId?: number): Promise<StudySession> => {
    const params: any = {};
    if (studyMode) params.mode = studyMode;
    if (deckId) params.deckId = deckId;
    
    const response = await api.get<ApiResponse<StudySession>>('/study/session', { params });
    return response.data.result;
  },

  // Get study mode stats for a specific deck
  getStudyModeStats: async (deckId: number): Promise<StudyModeStats> => {
    const response = await api.get<ApiResponse<StudyModeStats>>(`/study/decks/${deckId}/mode-stats`);
    return response.data.result;
  },

  // Review a card
  reviewCard: async (data: ReviewCardRequest): Promise<void> => {
    await api.post<ApiResponse<void>>('/study/review', data);
  },

  // Get cards for deck
  getCardsForDeck: async (deckId: number): Promise<Card[]> => {
    const response = await api.get<ApiResponse<Card[]>>(`/study/decks/${deckId}/cards`);
    return response.data.result || [];
  },

  // Get card by ID
  getCardById: async (cardId: number): Promise<Card> => {
    const response = await api.get<ApiResponse<Card>>(`/study/cards/${cardId}`);
    return response.data.result;
  },
};

