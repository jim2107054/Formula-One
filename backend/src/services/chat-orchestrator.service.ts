/**
 * Chat Orchestrator Service
 * Orchestrates chat interactions and coordinates with AI backend
 */
import { v4 as uuidv4 } from "uuid";
import { readJson, writeJson } from "../utils/fileStore";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    sources?: string[];
    confidence?: number;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageResult {
  message: ChatMessage;
  session: ChatSession;
}

const SESSIONS_FILE = "sessions.json";
const AI_BACKEND_URL =
  process.env.AI_BACKEND_URL || "http://localhost:8001/api/v1";

class ChatOrchestratorService {
  private async getSessions(): Promise<ChatSession[]> {
    return readJson<ChatSession>(SESSIONS_FILE);
  }

  private async saveSessions(sessions: ChatSession[]): Promise<void> {
    await writeJson(SESSIONS_FILE, sessions);
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    sessionId: string,
    userId: string,
    content: string,
  ): Promise<SendMessageResult> {
    const sessions = await this.getSessions();
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId); // && s.userId === userId?

    if (sessionIndex === -1) {
      throw new Error("Session not found");
    }

    const session = sessions[sessionIndex];

    // 1. Add User Message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      sessionId,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    session.messages.push(userMessage);

    // 2. Call AI Backend
    let aiResponseContent = "I'm sorry, I couldn't connect to the AI service.";
    try {
      const response = await fetch(`${AI_BACKEND_URL}/generation/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: content,
          generation_type: "explanation", // Using explanation for chat
          context: session.messages.map((m) => m.content).slice(-5), // Send last 5 messages as context? API mock ignore context for now
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiResponseContent = data.content;
      }
    } catch (e) {
      console.error("AI Backend Call Failed", e);
    }

    // 3. Add AI Message
    const aiMessage: ChatMessage = {
      id: uuidv4(),
      sessionId,
      role: "assistant",
      content: aiResponseContent,
      timestamp: new Date().toISOString(),
    };
    session.messages.push(aiMessage);
    session.updatedAt = new Date().toISOString();

    // Update session title if it's the first exchange and title is default
    if (session.messages.length <= 2) {
      session.title =
        content.substring(0, 30) + (content.length > 30 ? "..." : "");
    }

    sessions[sessionIndex] = session;
    await this.saveSessions(sessions);

    return {
      message: aiMessage,
      session,
    };
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(userId: string): Promise<ChatSession[]> {
    const sessions = await this.getSessions();
    // Filter by userId (Assuming userId might be simulated/shared for now or strict)
    // For now return all for simplicity or filter
    return sessions
      .filter((s) => s.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }

  /**
   * Get specific chat session
   */
  async getSession(
    sessionId: string,
    userId: string,
  ): Promise<ChatSession | null> {
    const sessions = await this.getSessions();
    return sessions.find((s) => s.id === sessionId) || null;
  }

  /**
   * Create new chat session
   */
  async createSession(userId: string, title?: string): Promise<ChatSession> {
    const sessions = await this.getSessions();
    const newSession: ChatSession = {
      id: uuidv4(),
      userId,
      title: title || "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessions.push(newSession);
    await this.saveSessions(sessions);
    return newSession;
  }

  /**
   * Delete chat session
   */
  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    const sessions = await this.getSessions();
    const initialLength = sessions.length;
    const filtered = sessions.filter((s) => s.id !== sessionId);

    if (filtered.length === initialLength) return false;

    await this.saveSessions(filtered);
    return true;
  }
}

export const chatOrchestratorService = new ChatOrchestratorService();
