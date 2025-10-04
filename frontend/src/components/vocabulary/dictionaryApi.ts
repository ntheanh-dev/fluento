import { api } from '../../configs/API';
import type { ApiResponse } from '../../types/api';

export interface DictionaryRequest {
  word: string;
}

export interface DictionaryResponse {
  word: string;
  audio: number[] | string; // byte array or base64 string from backend
  phonetic: string;
  meaning: string;
  pos: string; // Part of Speech
  example1: string;
  audioExample1: number[] | string; // byte array or base64 string from backend
  example2: string;
  audioExample2: number[] | string; // byte array or base64 string from backend
}

export const dictionaryApi = {
  lookupWord: async (request: DictionaryRequest): Promise<DictionaryResponse> => {
    const response = await api.post<ApiResponse<DictionaryResponse>>('/dictionary/lookup', request);
    return response.data.result;
  },
};
