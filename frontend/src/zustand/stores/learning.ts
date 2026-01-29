import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import api from "@/util/api";
import type {
  LearningContent,
  LearningContentState,
  ChatMessage,
  ChatSession,
  ChatState,
  SearchResult,
  SearchState,
  GeneratedContent,
  GenerationState,
  GenerationRequest,
} from "../types/learning";

// ==================== Content Store ====================
interface ContentStore extends LearningContentState {
  fetchContents: (params?: Record<string, string>) => Promise<void>;
  fetchContentById: (id: string) => Promise<void>;
  createContent: (content: Partial<LearningContent>) => Promise<void>;
  updateContent: (id: string, content: Partial<LearningContent>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  setFilters: (filters: Partial<LearningContentState["filters"]>) => void;
  clearError: () => void;
}

export const useContentStore = create<ContentStore>()((set, get) => ({
  contents: [],
  currentContent: null,
  loading: false,
  error: null,
  filters: {
    category: "",
    type: "",
    topic: "",
    difficulty: "",
  },

  fetchContents: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams({
        ...get().filters,
        ...params,
      });
      // Remove empty params
      for (const [key, value] of queryParams.entries()) {
        if (!value) queryParams.delete(key);
      }
      const response = await api.get(`/api/content?${queryParams}`);
      set({ contents: response.data.data || [], loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch contents";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  fetchContentById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/content/${id}`);
      set({ currentContent: response.data.data, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch content";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  createContent: async (content: Partial<LearningContent>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/api/content", content);
      set((state) => ({
        contents: [response.data.data, ...state.contents],
        loading: false,
      }));
      toast.success("Content created successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create content";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  updateContent: async (id: string, content: Partial<LearningContent>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/content`, { id, ...content });
      set((state) => ({
        contents: state.contents.map((c) => (c._id === id ? response.data.data : c)),
        currentContent: response.data.data,
        loading: false,
      }));
      toast.success("Content updated successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update content";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  deleteContent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/api/content?id=${id}`);
      set((state) => ({
        contents: state.contents.filter((c) => c._id !== id),
        loading: false,
      }));
      toast.success("Content deleted successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete content";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearError: () => set({ error: null }),
}));

// ==================== Chat Store ====================
interface ChatStore extends ChatState {
  createSession: (title?: string) => void;
  sendMessage: (content: string) => Promise<void>;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearCurrentSession: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      loading: false,
      error: null,

      createSession: (title?: string) => {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: title || `Chat ${new Date().toLocaleDateString()}`,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSession: newSession,
        }));
      },

      sendMessage: async (content: string) => {
        const { currentSession } = get();
        if (!currentSession) {
          get().createSession();
        }

        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "user",
          content,
          timestamp: new Date(),
        };

        // Add user message
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                messages: [...state.currentSession.messages, userMessage],
                updatedAt: new Date(),
              }
            : null,
          loading: true,
        }));

        try {
          const session = get().currentSession;
          const chatHistory = session?.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })) || [];

          const response = await api.post("/api/chat", {
            messages: chatHistory,
            includeContext: true,
          });

          if (response.data.success) {
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: response.data.data.message,
              timestamp: new Date(),
            };

            set((state) => {
              const updatedSession = state.currentSession
                ? {
                    ...state.currentSession,
                    messages: [...state.currentSession.messages, assistantMessage],
                    updatedAt: new Date(),
                  }
                : null;

              return {
                currentSession: updatedSession,
                sessions: state.sessions.map((s) =>
                  s.id === updatedSession?.id ? updatedSession : s
                ),
                loading: false,
              };
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to send message";
          set({ error: message, loading: false });
          toast.error(message);
        }
      },

      loadSession: (sessionId: string) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        if (session) {
          set({ currentSession: session });
        }
      },

      deleteSession: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSession:
            state.currentSession?.id === sessionId ? null : state.currentSession,
        }));
        toast.success("Chat session deleted");
      },

      clearCurrentSession: () => set({ currentSession: null }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "chat-store",
      partialize: (state) => ({
        sessions: state.sessions.slice(0, 20), // Keep last 20 sessions
      }),
    }
  )
);

// ==================== Search Store ====================
interface SearchStore extends SearchState {
  search: (query: string) => Promise<void>;
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchState["filters"]>) => void;
  clearResults: () => void;
  clearError: () => void;
}

export const useSearchStore = create<SearchStore>()((set, get) => ({
  query: "",
  results: [],
  loading: false,
  error: null,
  filters: {
    category: "",
    type: "",
  },

  search: async (query: string) => {
    if (!query.trim()) {
      set({ results: [], query: "" });
      return;
    }

    set({ loading: true, error: null, query });

    try {
      const { filters } = get();
      const params = new URLSearchParams({ query });
      if (filters.category) params.append("category", filters.category);
      if (filters.type) params.append("type", filters.type);

      const response = await api.get(`/api/search?${params}`);
      set({ results: response.data.data || [], loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  setQuery: (query: string) => set({ query }),

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearResults: () => set({ results: [], query: "" }),

  clearError: () => set({ error: null }),
}));

// ==================== Generation Store ====================
interface GenerationStore extends GenerationState {
  generate: (request: GenerationRequest) => Promise<string | null>;
  validate: (code: string, language?: string) => Promise<{ isValid: boolean; feedback: string } | null>;
  clearGenerated: () => void;
  clearError: () => void;
}

export const useGenerationStore = create<GenerationStore>()(
  persist(
    (set, get) => ({
      generatedContent: null,
      loading: false,
      error: null,
      history: [],

      generate: async (request: GenerationRequest) => {
        set({ loading: true, error: null });

        try {
          const response = await api.post("/api/generate", request);

          if (response.data.success) {
            const generated: GeneratedContent = {
              content: response.data.data.content,
              type: request.type,
              topic: request.topic,
              generatedAt: new Date(),
            };

            set((state) => ({
              generatedContent: generated,
              history: [generated, ...state.history].slice(0, 50),
              loading: false,
            }));

            toast.success("Content generated successfully!");
            return response.data.data.content;
          }
          return null;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Generation failed";
          set({ error: message, loading: false });
          toast.error(message);
          return null;
        }
      },

      validate: async (code: string, language = "python") => {
        set({ loading: true, error: null });

        try {
          const response = await api.post("/api/validate", { code, language });

          set({ loading: false });

          if (response.data.success) {
            return {
              isValid: response.data.data.isValid,
              feedback: response.data.data.feedback,
            };
          }
          return null;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Validation failed";
          set({ error: message, loading: false });
          toast.error(message);
          return null;
        }
      },

      clearGenerated: () => set({ generatedContent: null }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "generation-store",
      partialize: (state) => ({
        history: state.history.slice(0, 20),
      }),
    }
  )
);
