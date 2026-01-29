"use client";

import { Box, Button, Card, Flex, Heading, Select, Text, TextArea, TextField, Tabs } from "@radix-ui/themes";
import { useState } from "react";
import { FaRobot, FaSpinner, FaCopy, FaSave, FaCheck } from "react-icons/fa";
import api from "@/util/api";
import toast from "react-hot-toast";

export default function AIGeneratePage() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<"theory" | "lab">("theory");
  const [format, setFormat] = useState("notes");
  const [language, setLanguage] = useState("python");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

  // Validation state
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    issues: string[];
    suggestions: string[];
  } | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setGenerating(true);
    setGeneratedContent("");
    setValidationResult(null);

    try {
      const response = await api.post("/api/generate", {
        topic,
        type,
        format: type === "theory" ? format : undefined,
        language: type === "lab" ? language : undefined,
      });

      if (response.data.success) {
        setGeneratedContent(response.data.data.content);
        toast.success("Content generated successfully!");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const handleValidate = async () => {
    if (!generatedContent || type !== "lab") {
      toast.error("No code to validate");
      return;
    }

    setValidating(true);
    try {
      const response = await api.post("/api/validate", {
        code: generatedContent,
        language,
      });

      if (response.data.success) {
        setValidationResult(response.data.data);
        toast.success("Validation complete");
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate code");
    } finally {
      setValidating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Copied to clipboard!");
  };

  const handleSaveToContent = async () => {
    if (!generatedContent) {
      toast.error("No content to save");
      return;
    }

    try {
      await api.post("/api/content", {
        title: `AI Generated: ${topic}`,
        description: `Auto-generated ${type} content about ${topic}`,
        content: generatedContent,
        category: type,
        type: type === "theory" ? "note" : "code",
        topic,
        tags: ["ai-generated", type, topic.toLowerCase()],
        language: type === "lab" ? language : undefined,
      });
      toast.success("Content saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save content");
    }
  };

  return (
    <Box className="p-6">
      <Heading size="7" className="mb-2">AI Content Generator</Heading>
      <Text className="text-gray-600 mb-6">
        Generate learning materials using AI. Create theory notes, slides, or lab code examples.
      </Text>

      <Flex gap="6" direction={{ initial: "column", lg: "row" }}>
        {/* Generation Form */}
        <Card className="p-6 flex-1">
          <Heading size="4" className="mb-4">Generate Content</Heading>

          <Flex direction="column" gap="4">
            <Box>
              <Text className="text-sm mb-2 block font-medium">Content Type</Text>
              <Tabs.Root value={type} onValueChange={(v) => setType(v as "theory" | "lab")}>
                <Tabs.List>
                  <Tabs.Trigger value="theory">Theory</Tabs.Trigger>
                  <Tabs.Trigger value="lab">Lab / Code</Tabs.Trigger>
                </Tabs.List>
              </Tabs.Root>
            </Box>

            <Box>
              <Text className="text-sm mb-2 block font-medium">Topic / Prompt</Text>
              <TextArea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={type === "theory" 
                  ? "Enter a topic, e.g., 'Introduction to Machine Learning' or 'Binary Search Trees'"
                  : "Enter a coding topic, e.g., 'Implement a linked list' or 'Create a REST API endpoint'"
                }
                rows={3}
              />
            </Box>

            {type === "theory" ? (
              <Box>
                <Text className="text-sm mb-2 block font-medium">Output Format</Text>
                <Select.Root value={format} onValueChange={setFormat}>
                  <Select.Trigger className="w-full" />
                  <Select.Content>
                    <Select.Item value="notes">Study Notes</Select.Item>
                    <Select.Item value="slides">Presentation Slides</Select.Item>
                    <Select.Item value="summary">Quick Summary</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            ) : (
              <Box>
                <Text className="text-sm mb-2 block font-medium">Programming Language</Text>
                <Select.Root value={language} onValueChange={setLanguage}>
                  <Select.Trigger className="w-full" />
                  <Select.Content>
                    <Select.Item value="python">Python</Select.Item>
                    <Select.Item value="javascript">JavaScript</Select.Item>
                    <Select.Item value="java">Java</Select.Item>
                    <Select.Item value="cpp">C++</Select.Item>
                    <Select.Item value="c">C</Select.Item>
                    <Select.Item value="typescript">TypeScript</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            )}

            <Button 
              onClick={handleGenerate} 
              disabled={generating || !topic.trim()}
              className="!cursor-pointer"
              size="3"
            >
              {generating ? (
                <>
                  <FaSpinner className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FaRobot /> Generate Content
                </>
              )}
            </Button>
          </Flex>
        </Card>

        {/* Generated Content */}
        <Card className="p-6 flex-[1.5]">
          <Flex justify="between" align="center" className="mb-4">
            <Heading size="4">Generated Content</Heading>
            {generatedContent && (
              <Flex gap="2">
                <Button size="1" variant="soft" onClick={handleCopy} className="!cursor-pointer">
                  <FaCopy /> Copy
                </Button>
                <Button size="1" variant="soft" onClick={handleSaveToContent} className="!cursor-pointer">
                  <FaSave /> Save to CMS
                </Button>
                {type === "lab" && (
                  <Button 
                    size="1" 
                    variant="soft" 
                    color="orange"
                    onClick={handleValidate}
                    disabled={validating}
                    className="!cursor-pointer"
                  >
                    {validating ? <FaSpinner className="animate-spin" /> : <FaCheck />} Validate Code
                  </Button>
                )}
              </Flex>
            )}
          </Flex>

          {generating ? (
            <Flex align="center" justify="center" className="h-64">
              <Flex direction="column" align="center" gap="2">
                <FaSpinner className="animate-spin text-4xl text-[var(--Accent-default)]" />
                <Text>Generating content...</Text>
              </Flex>
            </Flex>
          ) : generatedContent ? (
            <Box>
              <Box className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {generatedContent}
                </pre>
              </Box>

              {/* Validation Results */}
              {validationResult && (
                <Card className="mt-4 p-4">
                  <Heading size="3" className="mb-2">
                    Validation Results
                  </Heading>
                  <Flex align="center" gap="2" className="mb-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      validationResult.valid 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {validationResult.valid ? "✓ Valid" : "✗ Has Issues"}
                    </span>
                  </Flex>
                  
                  {validationResult.issues.length > 0 && (
                    <Box className="mb-3">
                      <Text className="font-medium text-red-600 text-sm">Issues:</Text>
                      <ul className="list-disc list-inside text-sm">
                        {validationResult.issues.map((issue, i) => (
                          <li key={i} className="text-gray-700">{issue}</li>
                        ))}
                      </ul>
                    </Box>
                  )}

                  {validationResult.suggestions.length > 0 && (
                    <Box>
                      <Text className="font-medium text-blue-600 text-sm">Suggestions:</Text>
                      <ul className="list-disc list-inside text-sm">
                        {validationResult.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-gray-700">{suggestion}</li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </Card>
              )}
            </Box>
          ) : (
            <Flex align="center" justify="center" className="h-64 text-gray-400">
              <Flex direction="column" align="center" gap="2">
                <FaRobot className="text-4xl" />
                <Text>Enter a topic and click Generate to create content</Text>
              </Flex>
            </Flex>
          )}
        </Card>
      </Flex>
    </Box>
  );
}
