/**
 * AI Backend Service
 * 
 * Handles communication with the AI Backend (FastAPI)
 * Proxies requests from the Express backend to the AI service
 */

import FormData from 'form-data';

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8001';

interface AgentAskRequest {
  query: string;
}

interface AgentAskResponse {
  intent: {
    type: string;
    format?: string;
    topic?: string;
    confidence?: number;
  };
  response: {
    type: string;
    format: string;
    content: string | object;
  };
  sources_used: number;
  sources: string[];
}

interface ClassifyResponse {
  query: string;
  intent: {
    type: string;
    format?: string;
    topic?: string;
    confidence?: number;
  };
}

interface MemoryStatusResponse {
  documents: string[];
  total_chunks: number;
}

interface UploadResponse {
  status: string;
  filename: string;
  chunks_added: number;
}

interface TheoryRequest {
  topic: string;
  type: 'slides' | 'notes' | 'summary';
}

interface LabRequest {
  topic: string;
  language: string;
}

interface ValidationRequest {
  code: string;
  problem_context?: string;
}

interface ValidationResponse {
  syntax: {
    valid: boolean;
    error?: string;
  };
  review?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
}

interface GeminiAskRequest {
  query: string;
}

class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = AI_BACKEND_URL;
  }

  /**
   * Health check for AI backend
   */
  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`AI Backend health check failed: ${response.statusText}`);
    }
    return response.json() as Promise<{ status: string; service: string; version: string }>;
  }

  // ==================== Smart Agent Endpoints ====================

  /**
   * Get Smart Agent status
   */
  async getAgentStatus(): Promise<{
    service: string;
    description: string;
    documents_loaded: number;
    status: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/v1/agent/`);
    if (!response.ok) {
      throw new Error(`Failed to get agent status: ${response.statusText}`);
    }
    return response.json() as Promise<{
      service: string;
      description: string;
      documents_loaded: number;
      status: string;
    }>;
  }

  /**
   * Upload document to agent memory
   */
  async uploadToAgent(file: Buffer, filename: string, mimetype: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file, {
      filename,
      contentType: mimetype,
    });

    const response = await fetch(`${this.baseUrl}/api/v1/agent/upload`, {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload document: ${error}`);
    }
    return response.json() as Promise<UploadResponse>;
  }

  /**
   * Smart Ask - Routes to appropriate generator based on intent
   */
  async agentAsk(query: string): Promise<AgentAskResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/agent/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Agent ask failed: ${error}`);
    }
    return response.json() as Promise<AgentAskResponse>;
  }

  /**
   * Classify intent without generating content
   */
  async classifyIntent(query: string): Promise<ClassifyResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/agent/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Classification failed: ${error}`);
    }
    return response.json() as Promise<ClassifyResponse>;
  }

  /**
   * Get memory status
   */
  async getMemoryStatus(): Promise<MemoryStatusResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/agent/memory/status`);
    if (!response.ok) {
      throw new Error(`Failed to get memory status: ${response.statusText}`);
    }
    return response.json() as Promise<MemoryStatusResponse>;
  }

  /**
   * Clear all documents from memory
   */
  async clearMemory(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/agent/memory/clear`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to clear memory: ${response.statusText}`);
    }
    return response.json() as Promise<{ status: string; message: string }>;
  }

  // ==================== Gemini RAG Endpoints ====================

  /**
   * Upload document to Gemini
   */
  async uploadToGemini(file: Buffer, filename: string, mimetype: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file, {
      filename,
      contentType: mimetype,
    });

    const response = await fetch(`${this.baseUrl}/api/v1/upload`, {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload to Gemini: ${error}`);
    }
    return response.json();
  }

  /**
   * Ask Gemini with uploaded documents
   */
  async askGemini(query: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini ask failed: ${error}`);
    }
    return response.json();
  }

  /**
   * List uploaded Gemini files
   */
  async listGeminiFiles(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/files`);
    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Clear Gemini files
   */
  async clearGeminiFiles(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/files`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to clear files: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================== Generation Endpoints ====================

  /**
   * Get generation service status
   */
  async getGenerationStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/generation/`);
    if (!response.ok) {
      throw new Error(`Failed to get generation status: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Generate theory content (slides, notes, summary)
   */
  async generateTheory(request: TheoryRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/generation/theory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Theory generation failed: ${error}`);
    }
    return response.json();
  }

  /**
   * Generate lab exercise
   */
  async generateLab(request: LabRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/generation/lab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Lab generation failed: ${error}`);
    }
    return response.json();
  }

  // ==================== Validation Endpoints ====================

  /**
   * Validate code with syntax check and AI review
   */
  async validateCode(request: ValidationRequest): Promise<ValidationResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/validation/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Validation failed: ${error}`);
    }
    return response.json() as Promise<ValidationResponse>;
  }
}

export const aiService = new AIService();
export default aiService;
