"use client";

import { useState, useRef, useEffect } from "react";
import { chatService, ChatMessage, ChatSession } from "@/services/chat.service";
import Link from "next/link";

export default function ChatPage() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create or load session
    // For demo, just create new one or fetch latest
    initSession();
  }, []);

  const initSession = async () => {
    try {
      const history = await chatService.getHistory();
      if (history.length > 0) {
        setSession(history[0]);
      } else {
        const newSession = await chatService.createSession("New Chat");
        setSession(newSession);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session) return;

    const userMsg = input;
    setInput("");
    setLoading(true);

    // Optimistic Update
    const optimisticMsg: ChatMessage = {
      id: "temp-" + Date.now(),
      sessionId: session.id,
      role: "user",
      content: userMsg,
      timestamp: new Date().toISOString(),
    };

    setSession((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, optimisticMsg],
          }
        : null,
    );

    try {
      const result = await chatService.sendMessage(session.id, userMsg);
      setSession(result.session);
    } catch (error) {
      console.error("Failed to send", error);
      // TODO: Revert optimistic update
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Sidebar (Optional - Just simple list for now) */}
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 p-4 hidden md:flex flex-col">
        <Link href="/" className="mb-6 font-bold text-xl px-2">
          Formula One
        </Link>
        <button
          onClick={() => initSession()}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 mb-4"
        >
          + New Chat
        </button>
        <div className="flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-neutral-500 mb-2 uppercase">
            History
          </div>
          {/* To implement history listing properly, we need state for 'sessions' not just current 'session' */}
          <div className="bg-neutral-800/50 p-2 rounded text-sm truncate cursor-pointer hover:bg-neutral-800">
            {session?.title || "Current Chat"}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-neutral-800 flex items-center px-6 justify-between bg-neutral-900/50 backdrop-blur">
          <span className="font-semibold">{session?.title || "Chat"}</span>
          <span className="text-xs text-neutral-500">AI-Powered Assistant</span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!session ? (
            <div className="flex h-full items-center justify-center text-neutral-500">
              Initializing...
            </div>
          ) : session.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center flex-col gap-4 text-neutral-500">
              <div className="text-4xl">👋</div>
              <p>Ask me anything about the course!</p>
            </div>
          ) : (
            session.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-neutral-800 text-neutral-200 rounded-bl-none"
                  }`}
                >
                  <div className="text-sm cursor-text whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>
                  <div className="text-[10px] opacity-50 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-neutral-900 border-t border-neutral-800">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
            <input
              className="w-full bg-neutral-800 border border-neutral-700 rounded-full py-3 px-6 pr-12 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
