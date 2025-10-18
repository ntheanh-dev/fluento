// Writing component related interfaces
export interface Topic {
  id: number;
  name: string;
  description: string;
  writing: any[];
}

export interface TopicGroup {
  id: number;
  name: string;
  topics: Topic[];
}

export interface Level {
  id: number;
  name: string;
  description: string;
  writings: any[];
}

export interface SentenceCount {
  id: number;
  size: number;
  writings: any[];
}

export interface Tone {
  id: number;
  name: string;
  description: string;
  writings: any[];
}

// Writing practice session interface
export interface WritingSession {
  id: string;
  level: string;
  topic: string;
  sentenceCount: number;
  language: string;
  conversationId?: string;
  createdAt?: string;
  completedAt?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'abandoned';
}

// Writing generation request interface
export interface WritingGenerationRequest {
  level: string;
  topic: string;
  language: string;
  sentenceCount: number;
  tone: string;
  customText?: string;
}

// Writing generation response interface
export interface WritingGenerationResponse {
  conversationId: string;
  message?: string;
}
