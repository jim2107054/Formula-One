"use client";

import { Box, Button, Card, Flex, Heading, Text, TextArea } from "@radix-ui/themes";
import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaTrash, FaSpinner } from "react-icons/fa";
import api from "@/util/api";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AdminChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.post("/api/chat", {
        messages: chatHistory,
        includeContext: true,
      });

      if (response.data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: response.data.data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What topics are covered in this course?",
    "Explain binary search algorithm",
    "Generate notes on data structures",
    "Show me a Python code example for sorting",
    "Summarize the key concepts in machine learning",
  ];

  return (
    <Box className="p-6 h-[calc(100vh-40px)] flex flex-col">
      <Flex justify="between" align="center" className="mb-4">
        <Box>
          <Heading size="7">AI Chat Assistant</Heading>
          <Text className="text-gray-600">
            Ask questions about course materials, request explanations, or generate content.
          </Text>
        </Box>
        {messages.length > 0 && (
          <Button variant="soft" color="red" onClick={handleClear} className="!cursor-pointer">
            <FaTrash /> Clear Chat
          </Button>
        )}
      </Flex>

      {/* Chat Messages */}
      <Card className="flex-1 p-4 mb-4 overflow-hidden flex flex-col">
        <Box className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <Flex direction="column" align="center" justify="center" className="h-full">
              <FaRobot className="text-6xl text-gray-300 mb-4" />
              <Heading size="4" className="text-gray-400 mb-2">Start a Conversation</Heading>
              <Text className="text-gray-400 mb-6 text-center max-w-md">
                Ask me anything about course materials, request explanations, or generate learning content.
              </Text>
              
              {/* Suggested Questions */}
              <Box className="w-full max-w-lg">
                <Text className="text-sm text-gray-500 mb-2">Try asking:</Text>
                <Flex direction="column" gap="2">
                  {suggestedQuestions.map((question, i) => (
                    <Button 
                      key={i}
                      variant="soft" 
                      className="!cursor-pointer justify-start"
                      onClick={() => setInput(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </Flex>
              </Box>
            </Flex>
          ) : (
            <Flex direction="column" gap="4" className="py-2">
              {messages.map((message, index) => (
                <Flex 
                  key={index}
                  justify={message.role === "user" ? "end" : "start"}
                  gap="2"
                >
                  {message.role === "assistant" && (
                    <Box className="p-2 rounded-full bg-[var(--Accent-light)] h-fit">
                      <FaRobot className="text-[var(--Accent-default)]" />
                    </Box>
                  )}
                  <Box 
                    className={`max-w-[70%] p-4 rounded-lg ${
                      message.role === "user" 
                        ? "bg-[var(--Accent-default)] text-white" 
                        : "bg-gray-100"
                    }`}
                  >
                    <pre className="whitespace-pre-wrap text-sm font-sans">
                      {message.content}
                    </pre>
                    <Text className={`text-xs mt-2 ${
                      message.role === "user" ? "text-white/70" : "text-gray-400"
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </Text>
                  </Box>
                  {message.role === "user" && (
                    <Box className="p-2 rounded-full bg-gray-200 h-fit">
                      <FaUser className="text-gray-600" />
                    </Box>
                  )}
                </Flex>
              ))}
              {sending && (
                <Flex gap="2">
                  <Box className="p-2 rounded-full bg-[var(--Accent-light)] h-fit">
                    <FaRobot className="text-[var(--Accent-default)]" />
                  </Box>
                  <Box className="bg-gray-100 p-4 rounded-lg">
                    <FaSpinner className="animate-spin" />
                  </Box>
                </Flex>
              )}
              <div ref={messagesEndRef} />
            </Flex>
          )}
        </Box>
      </Card>

      {/* Input Area */}
      <Card className="p-4">
        <Flex gap="3">
          <Box className="flex-1">
            <TextArea
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
              disabled={sending}
            />
          </Box>
          <Button 
            size="3"
            onClick={handleSend} 
            disabled={sending || !input.trim()}
            className="!cursor-pointer self-end"
          >
            {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </Button>
        </Flex>
      </Card>
    </Box>
  );
}
