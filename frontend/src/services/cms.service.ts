import api from "@/util/api";

export interface ContentMetadata {
  topic: string;
  week: number;
  tags: string[];
  contentType: "slides" | "pdf" | "code" | "notes";
}

export interface Content {
  id: string;
  title: string;
  description: string;
  category: "theory" | "lab";
  metadata: ContentMetadata;
  filePath?: string;
  fileName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentRequest {
  title: string;
  description: string;
  category: "theory" | "lab";
  metadata: ContentMetadata;
  filePath?: string;
  fileName?: string;
}

export const cmsService = {
  async getAllContent(category?: "theory" | "lab") {
    const params = category ? { category } : {};
    const response = await api.get<{ success: boolean; data: Content[] }>(
      "/cms/content",
      { params },
    );
    return response.data.data;
  },

  async getContentById(id: string) {
    const response = await api.get<{ success: boolean; data: Content }>(
      `/cms/content/${id}`,
    );
    return response.data.data;
  },

  async createContent(data: CreateContentRequest) {
    const response = await api.post<{ success: boolean; data: Content }>(
      "/cms/content",
      data,
    );
    return response.data.data;
  },

  async updateContent(id: string, data: Partial<CreateContentRequest>) {
    const response = await api.put<{ success: boolean; data: Content }>(
      `/cms/content/${id}`,
      data,
    );
    return response.data.data;
  },

  async deleteContent(id: string) {
    const response = await api.delete(`/cms/content/${id}`);
    return response.data;
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{
      success: boolean;
      data: { filePath: string; fileName: string };
    }>("/cms/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },
};

export default cmsService;
