"use client";

import { Box, Button, Card, Flex, Heading, Text, TextArea, Tabs } from "@radix-ui/themes";
import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaTrash, FaSpinner, FaLightbulb, FaBook, FaCode } from "react-icons/fa";
import api from "@/util/api";
import toast from "react-hot-toast";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function StudentChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<"chat" | "generate">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generation state
  const [genTopic, setGenTopic] = useState("");
  const [genType, setGenType] = useState<"theory" | "lab">("theory");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

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

  const handleGenerate = async () => {
    if (!genTopic.trim() || generating) return;

    setGenerating(true);
    setGeneratedContent("");

    try {
      const response = await api.post("/api/generate", {
        topic: genTopic,
        type: genType,
        format: genType === "theory" ? "notes" : undefined,
        language: genType === "lab" ? "python" : undefined,
      });

      if (response.data.success) {
        setGeneratedContent(response.data.data.content);
        toast.success("Content generated!");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate content");
    } finally {
      setGenerating(false);
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
    "Explain the concept of recursion",
    "What are the key differences between arrays and linked lists?",
    "Help me understand object-oriented programming",
    "Can you summarize database normalization?",
    "What are the best practices for writing clean code?",
  ];

  return (
    <Theme>
      <Box className="p-6 h-[calc(100vh-120px)] flex flex-col">
        <Flex justify="between" align="center" className="mb-4">
          <Box>
            <Heading size="7">AI Learning Assistant</Heading>
            <Text className="text-gray-600">
              Get help with your studies, explanations, and generate learning materials.
            </Text>
          </Box>
        </Flex>

        {/* Mode Tabs */}
        <Tabs.Root value={mode} onValueChange={(v) => setMode(v as "chat" | "generate")} className="mb-4">
          <Tabs.List>
            <Tabs.Trigger value="chat">
              <FaRobot className="mr-2" /> Chat Assistant
            </Tabs.Trigger>
            <Tabs.Trigger value="generate">
              <FaLightbulb className="mr-2" /> Generate Content
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>

        {mode === "chat" ? (
          <>
            {/* Chat Messages */}
            <Card className="flex-1 p-4 mb-4 overflow-hidden flex flex-col">
              <Flex justify="end" className="mb-2">
                {messages.length > 0 && (
                  <Button variant="ghost" size="1" color="red" onClick={handleClear} className="!cursor-pointer">
                    <FaTrash /> Clear
                  </Button>
                )}
              </Flex>
              
              <Box className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                  <Flex direction="column" align="center" justify="center" className="h-full">
                    <FaRobot className="text-6xl text-gray-300 mb-4" />
                    <Heading size="4" className="text-gray-400 mb-2">Ask Me Anything!</Heading>
                    <Text className="text-gray-400 mb-6 text-center max-w-md">
                      I can help you understand course materials, explain concepts, or answer questions.
                    </Text>
                    
                    {/* Suggested Questions */}
                    <Box className="w-full max-w-lg">
                      <Text className="text-sm text-gray-500 mb-2">Try asking:</Text>
                      <Flex direction="column" gap="2">
                        {suggestedQuestions.map((question, i) => (
                          <Button 
                            key={i}
                            variant="soft" 
                            className="!cursor-pointer justify-start text-left"
                            onClick={() => setInput(question)}
                          >
                            💡 {question}
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
                          <Box className="p-2 rounded-full bg-purple-100 h-fit">
                            <FaRobot className="text-purple-600" />
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
                          <Box className="p-2 rounded-full bg-[var(--Accent-light)] h-fit">
                            <FaUser className="text-[var(--Accent-default)]" />
                          </Box>
                        )}
                      </Flex>
                    ))}
                    {sending && (
                      <Flex gap="2">
                        <Box className="p-2 rounded-full bg-purple-100 h-fit">
                          <FaRobot className="text-purple-600" />
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
                    placeholder="Type your question... (Press Enter to send)"
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
          </>
        ) : (
          /* Generate Content Mode */
          <Card className="flex-1 p-6 overflow-y-auto">
            <Flex gap="6" direction={{ initial: "column", lg: "row" }}>
              <Box className="flex-1">
                <Heading size="4" className="mb-4">Generate Learning Materials</Heading>
                
                <Flex direction="column" gap="4">
                  <Box>
                    <Text className="text-sm mb-2 block font-medium">What do you want to learn?</Text>
                    <TextArea
                      value={genTopic}
                      onChange={(e) => setGenTopic(e.target.value)}
                      placeholder="Enter a topic, e.g., 'Explain sorting algorithms' or 'Create a linked list in Python'"
                      rows={3}
                    />
                  </Box>

                  <Flex gap="4">
                    <Button 
                      variant={genType === "theory" ? "solid" : "soft"}
                      onClick={() => setGenType("theory")}
                      className="!cursor-pointer flex-1"
                    >
                      <FaBook /> Theory Notes
                    </Button>
                    <Button 
                      variant={genType === "lab" ? "solid" : "soft"}
                      onClick={() => setGenType("lab")}
                      className="!cursor-pointer flex-1"
                    >
                      <FaCode /> Code Example
                    </Button>
                  </Flex>

                  <Button 
                    size="3"
                    onClick={handleGenerate}
                    disabled={generating || !genTopic.trim()}
                    className="!cursor-pointer"
                  >
                    {generating ? (
                      <>
                        <FaSpinner className="animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <FaLightbulb /> Generate Content
                      </>
                    )}
                  </Button>
                </Flex>
              </Box>

              <Box className="flex-[1.5]">
                <Heading size="4" className="mb-4">Generated Content</Heading>
                
                {generating ? (
                  <Flex align="center" justify="center" className="h-64">
                    <Flex direction="column" align="center" gap="2">
                      <FaSpinner className="animate-spin text-4xl text-purple-600" />
                      <Text>Generating your content...</Text>
                    </Flex>
                  </Flex>
                ) : generatedContent ? (
                  <Box className={`rounded-lg p-4 max-h-[400px] overflow-y-auto ${
                    genType === "lab" ? "bg-gray-900" : "bg-gray-50"
                  }`}>
                    <pre className={`whitespace-pre-wrap text-sm font-mono ${
                      genType === "lab" ? "text-green-400" : "text-gray-800"
                    }`}>
                      {generatedContent}
                    </pre>
                  </Box>
                ) : (
                  <Flex align="center" justify="center" className="h-64 text-gray-400 bg-gray-50 rounded-lg">
                    <Flex direction="column" align="center" gap="2">
                      <FaLightbulb className="text-4xl" />
                      <Text>Enter a topic and click Generate</Text>
                    </Flex>
                  </Flex>
                )}
              </Box>
            </Flex>
          </Card>
        )}
      </Box>
    </Theme>
  );
}
