// Learning Platform Types

export interface LearningContent {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: "theory" | "lab";
  type: string;
  topic: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  createdBy: string;
  validated: boolean;
  validationScore?: number;
  validationFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  type: string;
  relevanceScore: number;
  highlights?: string[];
}

export interface GenerationRequest {
  topic: string;
  type: "theory" | "lab";
  format?: string;
  language?: string;
  difficulty?: string;
}

export interface GeneratedContent {
  content: string;
  type: string;
  topic: string;
  generatedAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  feedback: string;
  suggestions: string[];
}

// Store States
export interface LearningContentState {
  contents: LearningContent[];
  currentContent: LearningContent | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    type: string;
    topic: string;
    difficulty: string;
  };
}

export interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  loading: boolean;
  error: string | null;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    type: string;
  };
}

export interface GenerationState {
  generatedContent: GeneratedContent | null;
  loading: boolean;
  error: string | null;
  history: GeneratedContent[];
}
