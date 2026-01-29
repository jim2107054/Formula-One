import api from "@/util/api";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export const chatService = {
  async sendMessage(sessionId: string, message: string) {
    const response = await api.post<{
      success: boolean;
      data: { message: ChatMessage; session: ChatSession };
    }>("/chat/message", {
      sessionId,
      message,
    });
    return response.data.data;
  },

  async createSession(title?: string) {
    const response = await api.post<{ success: boolean; data: ChatSession }>(
      "/chat/session",
      { title },
    );
    return response.data.data;
  },

  async getSession(sessionId: string) {
    const response = await api.get<{ success: boolean; data: ChatSession }>(
      `/chat/session/${sessionId}`,
    );
    return response.data.data;
  },

  async getHistory() {
    const response = await api.get<{ success: boolean; data: ChatSession[] }>(
      "/chat/history",
    );
    return response.data.data;
  },
};
