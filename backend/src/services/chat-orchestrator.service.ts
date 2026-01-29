import { ChatSessionModel, IChatSession } from "../models/chat-session.model";
import { v4 as uuidv4 } from "uuid";

export interface SendMessageResult {
  message: any;
  session: IChatSession;
}

const AI_BACKEND_URL =
  process.env.AI_BACKEND_URL || "http://localhost:8001/api/v1";

class ChatOrchestratorService {
  /**
   * Send a message and get AI response
   */
  async sendMessage(
    sessionId: string,
    userId: string,
    content: string,
  ): Promise<SendMessageResult> {
    let session = await ChatSessionModel.findOne({ _id: sessionId });

    if (!session) {
      throw new Error("Session not found");
    }

    // 1. Add User Message
    const userMessage = {
      id: uuidv4(),
      role: "user" as const,
      content,
      timestamp: new Date(),
    };
    session.messages.push(userMessage);

    // 2. Call AI Backend (Real call to Python service)
    let aiResponseContent = "I'm sorry, I couldn't connect to the AI service.";
    try {
      const response = await fetch(`${AI_BACKEND_URL}/generation/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: content,
          generation_type: "explanation",
          context: session.messages.map((m) => m.content).slice(-5),
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
    const aiMessage = {
      id: uuidv4(),
      role: "assistant" as const,
      content: aiResponseContent,
      timestamp: new Date(),
    };
    session.messages.push(aiMessage);

    // Update title logic
    if (session.messages.length <= 2) {
      session.title =
        content.substring(0, 30) + (content.length > 30 ? "..." : "");
    }

    await session.save();

    return {
      message: aiMessage,
      session,
    };
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(userId: string): Promise<IChatSession[]> {
    return ChatSessionModel.find({ userId }).sort({ updatedAt: -1 });
  }

  /**
   * Get specific chat session
   */
  async getSession(
    sessionId: string,
    userId: string,
  ): Promise<IChatSession | null> {
    try {
      return await ChatSessionModel.findOne({ _id: sessionId });
    } catch {
      return null;
    }
  }

  /**
   * Create new chat session
   */
  async createSession(userId: string, title?: string): Promise<IChatSession> {
    const session = new ChatSessionModel({
      userId,
      title: title || "New Chat",
      messages: [],
    });
    return session.save();
  }

  /**
   * Delete chat session
   */
  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const result = await ChatSessionModel.deleteOne({ _id: sessionId });
      return result.deletedCount === 1;
    } catch {
      return false;
    }
  }
}

export const chatOrchestratorService = new ChatOrchestratorService();
