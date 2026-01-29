"use client";

import { Box, Card, Flex, Grid, Heading, Text, TextField, Select, Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { FaFileAlt, FaSlideshare, FaFilePdf, FaBook, FaSearch } from "react-icons/fa";
import api from "@/util/api";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

interface Content {
  _id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  topic: string;
  week: number | null;
  tags: string[];
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  slide: FaSlideshare,
  pdf: FaFilePdf,
  note: FaFileAlt,
  reference: FaBook,
};

export default function StudentTheoryPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get("/api/content?category=theory&limit=100");
        const data = response.data.data || [];
        setContents(data);
        
        // Extract unique topics
        const uniqueTopics = [...new Set(data.map((c: Content) => c.topic).filter(Boolean))] as string[];
        setTopics(uniqueTopics);
      } catch (error) {
        console.error("Error fetching theory content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const filteredContents = contents.filter((content) => {
    const matchesSearch = !search || 
      content.title.toLowerCase().includes(search.toLowerCase()) ||
      content.description?.toLowerCase().includes(search.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesTopic = topicFilter === "all" || content.topic === topicFilter;
    return matchesSearch && matchesTopic;
  });

  // Group by topic
  const groupedByTopic = filteredContents.reduce((acc, content) => {
    const topic = content.topic || "General";
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(content);
    return acc;
  }, {} as Record<string, Content[]>);

  return (
    <Theme>
      <Box className="p-6">
        <Heading size="7" className="mb-2">Theory Materials</Heading>
        <Text className="text-gray-600 mb-6">
          Browse lecture slides, notes, PDFs, and reference materials for your course.
        </Text>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <Flex gap="4" align="end" wrap="wrap">
            <Box className="flex-1 min-w-[200px]">
              <Text className="text-sm mb-2 block">Search</Text>
              <TextField.Root
                placeholder="Search theory materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
            <Box>
              <Text className="text-sm mb-2 block">Topic</Text>
              <Select.Root value={topicFilter} onValueChange={setTopicFilter}>
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="all">All Topics</Select.Item>
                  {topics.map((topic) => (
                    <Select.Item key={topic} value={topic}>{topic}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>
        </Card>

        <Flex gap="6" direction={{ initial: "column", lg: "row" }}>
          {/* Content List */}
          <Box className="flex-1">
            {loading ? (
              <Text>Loading...</Text>
            ) : filteredContents.length === 0 ? (
              <Card className="p-8 text-center">
                <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-4" />
                <Text className="text-gray-500">No theory content found.</Text>
              </Card>
            ) : (
              <Flex direction="column" gap="6">
                {Object.entries(groupedByTopic).map(([topic, items]) => (
                  <Box key={topic}>
                    <Heading size="4" className="mb-3 text-[var(--Accent-dark-2)]">
                      📚 {topic}
                    </Heading>
                    <Grid columns={{ initial: "1", md: "2" }} gap="3">
                      {items.map((content) => {
                        const TypeIcon = TYPE_ICONS[content.type] || FaFileAlt;
                        return (
                          <Card 
                            key={content._id} 
                            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                              selectedContent?._id === content._id ? "ring-2 ring-[var(--Accent-default)]" : ""
                            }`}
                            onClick={() => setSelectedContent(content)}
                          >
                            <Flex gap="3" align="start">
                              <Box className="p-2 rounded-lg bg-blue-50">
                                <TypeIcon className="text-blue-600" />
                              </Box>
                              <Box className="flex-1">
                                <Text className="font-medium">{content.title}</Text>
                                <Text className="text-gray-500 text-sm line-clamp-1">
                                  {content.description || "No description"}
                                </Text>
                                <Flex gap="1" className="mt-2" wrap="wrap">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                    {content.type}
                                  </span>
                                  {content.week && (
                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                      Week {content.week}
                                    </span>
                                  )}
                                </Flex>
                              </Box>
                            </Flex>
                          </Card>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}
              </Flex>
            )}
          </Box>

          {/* Content Preview */}
          {selectedContent && (
            <Card className="p-6 flex-1 max-h-[700px] overflow-y-auto sticky top-6">
              <Heading size="5" className="mb-2">{selectedContent.title}</Heading>
              <Flex gap="2" className="mb-4" wrap="wrap">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {selectedContent.type}
                </span>
                {selectedContent.topic && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {selectedContent.topic}
                  </span>
                )}
                {selectedContent.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </Flex>

              {selectedContent.description && (
                <Box className="mb-4 p-3 bg-gray-50 rounded">
                  <Text className="text-gray-700">{selectedContent.description}</Text>
                </Box>
              )}

              <Box className="bg-white border rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm">
                  {selectedContent.content || "No content available."}
                </pre>
              </Box>
            </Card>
          )}
        </Flex>
      </Box>
    </Theme>
  );
}
