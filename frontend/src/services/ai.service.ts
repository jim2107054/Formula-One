import Cookies from "js-cookie";

const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://localhost:8001/api/v1";

interface SearchResult {
  id: string;
  title: string;
  type: "theory" | "lab" | "notes" | "code";
  relevanceScore: number;
  excerpt: string;
  source: string;
  matchedKeywords: string[];
  week?: number;
}

interface GenerationRequest {
  type: "notes" | "slides" | "code" | "summary" | "explanation";
  prompt: string;
  topic?: string;
  language?: string;
}

interface GenerationResponse {
  content: string;
  type: string;
  sources?: string[];
}

interface ValidationRequest {
  content: string;
  contentType: "code" | "text";
  validations: ("syntax" | "grounding" | "rubric" | "test")[];
  language?: string;
}

interface ValidationResult {
  type: string;
  status: "pass" | "warning" | "fail";
  message: string;
  details?: string[];
  score?: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  response: string;
  sources?: string[];
}

const getHeaders = () => {
  const token = Cookies.get("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const aiService = {
  // Intelligent Search (RAG-based)
  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/search`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error("Search failed");
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  },

  // AI Content Generation
  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/generate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error("Generation failed");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Generation error:", error);
      throw error;
    }
  },

  // Content Validation
  async validate(request: ValidationRequest): Promise<ValidationResult[]> {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/validate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error("Validation failed");
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Validation error:", error);
      throw error;
    }
  },

  // Chat Interface
  async chat(messages: ChatMessage[], newMessage: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/chat`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          messages,
          message: newMessage,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Chat failed");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  },

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error("Health check error:", error);
      return false;
    }
  },
};

export default aiService;
