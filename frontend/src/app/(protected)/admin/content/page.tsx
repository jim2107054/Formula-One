"use client";

import { Box, Button, Card, Dialog, Flex, Grid, Heading, Select, Table, Text, TextArea, TextField } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFileAlt, FaCode, FaFilePdf, FaSlideshare } from "react-icons/fa";
import api from "@/util/api";
import toast from "react-hot-toast";

interface Content {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: "theory" | "lab";
  type: "slide" | "pdf" | "code" | "note" | "reference";
  topic: string;
  week: number | null;
  tags: string[];
  language?: string;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  slide: FaSlideshare,
  pdf: FaFilePdf,
  code: FaCode,
  note: FaFileAlt,
  reference: FaFileAlt,
};

export default function ContentPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "theory",
    type: "note",
    topic: "",
    week: "",
    tags: "",
    language: "python",
  });

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      params.append("limit", "50");

      const response = await api.get(`/api/content?${params.toString()}`);
      setContents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [categoryFilter]);

  const handleSearch = () => {
    fetchContents();
  };

  const handleOpenDialog = (content?: Content) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        title: content.title,
        description: content.description,
        content: content.content,
        category: content.category,
        type: content.type,
        topic: content.topic,
        week: content.week?.toString() || "",
        tags: content.tags.join(", "),
        language: content.language || "python",
      });
    } else {
      setEditingContent(null);
      setFormData({
        title: "",
        description: "",
        content: "",
        category: "theory",
        type: "note",
        topic: "",
        week: "",
        tags: "",
        language: "python",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        week: formData.week ? parseInt(formData.week) : null,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      if (editingContent) {
        await api.put("/api/content", {
          _id: editingContent._id,
          ...payload,
        });
        toast.success("Content updated successfully");
      } else {
        await api.post("/api/content", payload);
        toast.success("Content created successfully");
      }
      setDialogOpen(false);
      fetchContents();
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    
    try {
      await api.delete(`/api/content?id=${contentId}`);
      toast.success("Content deleted successfully");
      fetchContents();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    }
  };

  const filteredContents = typeFilter === "all" 
    ? contents 
    : contents.filter((c) => c.type === typeFilter);

  return (
    <Box className="p-6">
      <Flex justify="between" align="center" className="mb-6">
        <Heading size="7">Content Management</Heading>
        <Button onClick={() => handleOpenDialog()} className="!cursor-pointer">
          <FaPlus /> Add Content
        </Button>
      </Flex>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <Flex gap="4" align="end" wrap="wrap">
          <Box className="flex-1 min-w-[200px]">
            <Text className="text-sm mb-2 block">Search</Text>
            <TextField.Root
              placeholder="Search by title, topic, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </Box>
          <Box>
            <Text className="text-sm mb-2 block">Category</Text>
            <Select.Root value={categoryFilter} onValueChange={setCategoryFilter}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="all">All Categories</Select.Item>
                <Select.Item value="theory">Theory</Select.Item>
                <Select.Item value="lab">Lab</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
          <Box>
            <Text className="text-sm mb-2 block">Type</Text>
            <Select.Root value={typeFilter} onValueChange={setTypeFilter}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="all">All Types</Select.Item>
                <Select.Item value="slide">Slides</Select.Item>
                <Select.Item value="pdf">PDFs</Select.Item>
                <Select.Item value="code">Code</Select.Item>
                <Select.Item value="note">Notes</Select.Item>
                <Select.Item value="reference">References</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
          <Button onClick={handleSearch} className="!cursor-pointer">
            <FaSearch /> Search
          </Button>
        </Flex>
      </Card>

      {/* Content Grid */}
      {loading ? (
        <Text className="text-center py-8">Loading...</Text>
      ) : filteredContents.length === 0 ? (
        <Card className="p-8 text-center">
          <Text>No content found. Start by adding new content.</Text>
        </Card>
      ) : (
        <Grid columns={{ initial: "1", md: "2", lg: "3" }} gap="4">
          {filteredContents.map((content) => {
            const TypeIcon = TYPE_ICONS[content.type] || FaFileAlt;
            return (
              <Card key={content._id} className="p-4">
                <Flex direction="column" gap="2">
                  <Flex justify="between" align="start">
                    <Flex align="center" gap="2">
                      <TypeIcon className="text-[var(--Accent-default)]" />
                      <Text className={`px-2 py-0.5 rounded text-xs ${
                        content.category === "theory" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {content.category}
                      </Text>
                    </Flex>
                    <Flex gap="1">
                      <Button size="1" variant="ghost" onClick={() => handleOpenDialog(content)} className="!cursor-pointer">
                        <FaEdit />
                      </Button>
                      <Button size="1" variant="ghost" color="red" onClick={() => handleDelete(content._id)} className="!cursor-pointer">
                        <FaTrash />
                      </Button>
                    </Flex>
                  </Flex>
                  
                  <Heading size="3">{content.title}</Heading>
                  <Text className="text-gray-600 text-sm line-clamp-2">
                    {content.description || "No description"}
                  </Text>
                  
                  {content.topic && (
                    <Text className="text-sm">
                      <strong>Topic:</strong> {content.topic}
                    </Text>
                  )}
                  
                  {content.tags.length > 0 && (
                    <Flex gap="1" wrap="wrap">
                      {content.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {content.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{content.tags.length - 3}</span>
                      )}
                    </Flex>
                  )}
                </Flex>
              </Card>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content maxWidth="600px" className="max-h-[90vh] overflow-y-auto">
          <Dialog.Title>{editingContent ? "Edit Content" : "Add New Content"}</Dialog.Title>
          
          <Flex direction="column" gap="3" className="mt-4">
            <Box>
              <Text className="text-sm mb-1 block">Title *</Text>
              <TextField.Root
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Content title"
              />
            </Box>

            <Flex gap="3">
              <Box className="flex-1">
                <Text className="text-sm mb-1 block">Category *</Text>
                <Select.Root 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <Select.Trigger className="w-full" />
                  <Select.Content>
                    <Select.Item value="theory">Theory</Select.Item>
                    <Select.Item value="lab">Lab</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
              <Box className="flex-1">
                <Text className="text-sm mb-1 block">Type *</Text>
                <Select.Root 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <Select.Trigger className="w-full" />
                  <Select.Content>
                    <Select.Item value="slide">Slide</Select.Item>
                    <Select.Item value="pdf">PDF</Select.Item>
                    <Select.Item value="code">Code</Select.Item>
                    <Select.Item value="note">Note</Select.Item>
                    <Select.Item value="reference">Reference</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>

            <Box>
              <Text className="text-sm mb-1 block">Topic</Text>
              <TextField.Root
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Topic name"
              />
            </Box>

            <Flex gap="3">
              <Box className="flex-1">
                <Text className="text-sm mb-1 block">Week</Text>
                <TextField.Root
                  type="number"
                  value={formData.week}
                  onChange={(e) => setFormData({ ...formData, week: e.target.value })}
                  placeholder="Week number"
                />
              </Box>
              {formData.category === "lab" && (
                <Box className="flex-1">
                  <Text className="text-sm mb-1 block">Language</Text>
                  <Select.Root 
                    value={formData.language} 
                    onValueChange={(v) => setFormData({ ...formData, language: v })}
                  >
                    <Select.Trigger className="w-full" />
                    <Select.Content>
                      <Select.Item value="python">Python</Select.Item>
                      <Select.Item value="javascript">JavaScript</Select.Item>
                      <Select.Item value="java">Java</Select.Item>
                      <Select.Item value="cpp">C++</Select.Item>
                      <Select.Item value="c">C</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
              )}
            </Flex>

            <Box>
              <Text className="text-sm mb-1 block">Tags (comma separated)</Text>
              <TextField.Root
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </Box>

            <Box>
              <Text className="text-sm mb-1 block">Description</Text>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </Box>

            <Box>
              <Text className="text-sm mb-1 block">Content</Text>
              <TextArea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Main content (markdown supported)"
                rows={8}
              />
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" className="!cursor-pointer">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleSubmit} className="!cursor-pointer">
              {editingContent ? "Update" : "Create"}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
