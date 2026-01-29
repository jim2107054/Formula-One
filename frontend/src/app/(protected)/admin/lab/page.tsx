"use client";

import { Box, Card, Flex, Grid, Heading, Text, Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { FaCode, FaFlask, FaPlus, FaPython, FaJava, FaJs } from "react-icons/fa";
import api from "@/util/api";
import Link from "next/link";

interface Content {
  _id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  topic: string;
  language: string;
  tags: string[];
  createdAt: string;
}

const LANG_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  python: FaPython,
  java: FaJava,
  javascript: FaJs,
};

export default function LabPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get("/cms/content?category=lab&limit=50");
        setContents(response.data.data || response.data || []);
      } catch (error) {
        console.error("Error fetching lab content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Group by language
  const groupedByLanguage = contents.reduce((acc, content) => {
    const lang = content.language || "other";
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(content);
    return acc;
  }, {} as Record<string, Content[]>);

  return (
    <Box className="p-6">
      <Flex justify="between" align="center" className="mb-6">
        <Box>
          <Heading size="7">Lab Materials</Heading>
          <Text className="text-gray-600">
            Code files, programming examples, and lab exercises.
          </Text>
        </Box>
        <Flex gap="2">
          <Link href="/admin/ai-generate">
            <Button variant="soft" className="!cursor-pointer">
              <FaCode /> Generate Code
            </Button>
          </Link>
          <Link href="/admin/content">
            <Button className="!cursor-pointer">
              <FaPlus /> Add Content
            </Button>
          </Link>
        </Flex>
      </Flex>

      <Flex gap="6" direction={{ initial: "column", lg: "row" }}>
        {/* Content List */}
        <Box className="flex-1">
          {loading ? (
            <Text>Loading...</Text>
          ) : contents.length === 0 ? (
            <Card className="p-8 text-center">
              <FaFlask className="text-4xl text-gray-300 mx-auto mb-4" />
              <Heading size="4" className="text-gray-400 mb-2">No Lab Content</Heading>
              <Text className="text-gray-400 mb-4">
                Add lab materials like code files and programming exercises.
              </Text>
              <Link href="/admin/content">
                <Button className="!cursor-pointer">
                  <FaPlus /> Add Lab Content
                </Button>
              </Link>
            </Card>
          ) : (
            <Flex direction="column" gap="6">
              {Object.entries(groupedByLanguage).map(([language, items]) => {
                const LangIcon = LANG_ICONS[language] || FaCode;
                return (
                  <Box key={language}>
                    <Flex align="center" gap="2" className="mb-3">
                      <LangIcon className="text-[var(--Accent-default)]" />
                      <Heading size="4" className="text-[var(--Accent-dark-2)] capitalize">
                        {language}
                      </Heading>
                    </Flex>
                    <Grid columns={{ initial: "1", md: "2" }} gap="4">
                      {items.map((content) => (
                        <Card 
                          key={content._id} 
                          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                            selectedContent?._id === content._id ? "ring-2 ring-[var(--Accent-default)]" : ""
                          }`}
                          onClick={() => setSelectedContent(content)}
                        >
                          <Flex gap="3" align="start">
                            <Box className="p-3 rounded-lg bg-green-50">
                              <FaCode className="text-green-600 text-xl" />
                            </Box>
                            <Box className="flex-1">
                              <Heading size="3" className="mb-1">{content.title}</Heading>
                              <Text className="text-gray-600 text-sm line-clamp-2">
                                {content.description || content.topic || "No description"}
                              </Text>
                              <Flex gap="2" className="mt-2" wrap="wrap">
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                  {content.language || "code"}
                                </span>
                                {content.tags.slice(0, 2).map((tag, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </Flex>
                            </Box>
                          </Flex>
                        </Card>
                      ))}
                    </Grid>
                  </Box>
                );
              })}
            </Flex>
          )}
        </Box>

        {/* Code Preview */}
        {selectedContent && (
          <Card className="p-6 flex-1 max-h-[600px] overflow-y-auto">
            <Heading size="4" className="mb-2">{selectedContent.title}</Heading>
            <Flex gap="2" className="mb-4" wrap="wrap">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                {selectedContent.language || "code"}
              </span>
              {selectedContent.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {tag}
                </span>
              ))}
            </Flex>
            
            {selectedContent.description && (
              <Text className="text-gray-600 mb-4">{selectedContent.description}</Text>
            )}

            <Box className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {selectedContent.content}
              </pre>
            </Box>
          </Card>
        )}
      </Flex>
    </Box>
  );
}
