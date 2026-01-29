"use client";

import { useState, useRef, useEffect } from "react";
import {
  FaComments,
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaBook,
  FaSearch,
  FaMagic,
  FaCheckCircle,
  FaLightbulb,
  FaHistory,
  FaPlus,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import aiService from "@/services/ai.service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const quickActions = [
  {
    icon: FaBook,
    label: "Explain a concept",
    prompt: "Can you explain the concept of ",
  },
  {
    icon: FaSearch,
    label: "Search materials",
    prompt: "Find materials about ",
  },
  {
    icon: FaMagic,
    label: "Generate notes",
    prompt: "Generate study notes for ",
  },
  {
    icon: FaCheckCircle,
    label: "Review my code",
    prompt: "Please review this code and suggest improvements: ",
  },
];

const sampleSessions: ChatSession[] = [
  {
    id: "1",
    title: "Neural Networks Discussion",
    lastMessage: "How does backpropagation work?",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    title: "Python Data Structures",
    lastMessage: "Explain linked lists vs arrays",
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: "3",
    title: "Machine Learning Basics",
    lastMessage: "What is gradient descent?",
    timestamp: new Date(Date.now() - 172800000),
  },
];

export default function ChatPage() {
  useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessions] = useState<ChatSession[]>(sampleSessions);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // Call AI backend chat API
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      
      const response = await aiService.chat(chatHistory, userInput);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        sources: response.sources || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      // Fallback response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting to the service right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveSession(null);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar - Chat History */}
      <div className="hidden lg:flex w-72 flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--Primary)] text-white rounded-lg hover:bg-[var(--Primary-dark)] transition-colors"
          >
            <FaPlus />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3 flex items-center gap-2">
            <FaHistory className="w-3 h-3" />
            Recent Chats
          </h3>
          <div className="space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeSession === session.id
                    ? "bg-[var(--Primary-light)]"
                    : "hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-sm truncate">{session.title}</p>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {session.lastMessage}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[var(--Primary)] to-[var(--Accent-default)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FaRobot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">EduAI Assistant</h2>
              <p className="text-white/70 text-sm">Ask anything about your courses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-white text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <FaComments className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                How can I help you today?
              </h3>
              <p className="text-gray-600 max-w-md mb-8">
                I can help you search materials, explain concepts, generate notes,
                and answer questions about your courses.
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 max-w-lg">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors group"
                    >
                      <div className="w-10 h-10 bg-[var(--Primary-light)] rounded-lg flex items-center justify-center group-hover:bg-[var(--Primary)] transition-colors">
                        <Icon className="w-5 h-5 text-[var(--Primary)] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      message.role === "user"
                        ? "bg-[var(--Primary)]"
                        : "bg-gradient-to-br from-pink-500 to-pink-600"
                    }`}
                  >
                    {message.role === "user" ? (
                      <FaUser className="w-5 h-5 text-white" />
                    ) : (
                      <FaRobot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[70%] ${
                      message.role === "user" ? "text-right" : ""
                    }`}
                  >
                    <div
                      className={`inline-block p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-[var(--Primary)] text-white rounded-tr-none"
                          : "bg-gray-100 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.sources && message.role === "assistant" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Sources:</span>
                        {message.sources.map((source, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                    <FaRobot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or request help..."
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--Primary)] focus:border-transparent resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-[var(--Primary)] text-white rounded-xl hover:bg-[var(--Primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            <FaLightbulb className="inline w-3 h-3 mr-1" />
            Responses are generated based on your course materials
          </p>
        </div>
      </div>
    </div>
  );
}
