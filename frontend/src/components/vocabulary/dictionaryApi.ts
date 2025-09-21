import { api } from '../../configs/API';
import type { ApiResponse } from '../../types/api';

export interface DictionaryRequest {
  word: string;
}

export interface DictionaryResponse {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  pos: string; // Part of Speech
  example: string;
  translation: string;
  audio: string | null;
}

export const dictionaryApi = {
  lookupWord: async (request: DictionaryRequest): Promise<DictionaryResponse> => {
    const response = await api.post<ApiResponse<DictionaryResponse>>('/dictionary/lookup', request);
    return response.data.result;
  },
};
