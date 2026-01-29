import Cookies from "js-cookie";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000/api";

export interface TheoryMaterial {
  id: string;
  title: string;
  description: string;
  type: "slide" | "pdf" | "notes" | "reference";
  topic: string;
  week: number;
  thumbnail: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  downloads?: number;
}

export interface LabMaterial {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  topic: string;
  week: number;
  code?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  downloads?: number;
}

export interface ContentStats {
  totalTheory: number;
  totalLab: number;
  totalViews: number;
  totalDownloads: number;
  recentUploads: number;
}

const getHeaders = (isFormData = false) => {
  const token = Cookies.get("token");
  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
};

export const contentService = {
  // Theory Materials
  async getTheoryMaterials(filters?: {
    type?: string;
    topic?: string;
    week?: number;
    search?: string;
  }): Promise<TheoryMaterial[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.topic) params.append("topic", filters.topic);
      if (filters?.week) params.append("week", filters.week.toString());
      if (filters?.search) params.append("search", filters.search);
      
      const response = await fetch(`${BACKEND_URL}/content/theory?${params}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch theory materials");
      }
      
      const data = await response.json();
      return data.materials || [];
    } catch (error) {
      console.error("Get theory materials error:", error);
      throw error;
    }
  },

  async getTheoryMaterial(id: string): Promise<TheoryMaterial> {
    try {
      const response = await fetch(`${BACKEND_URL}/content/theory/${id}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch theory material");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get theory material error:", error);
      throw error;
    }
  },

  async createTheoryMaterial(formData: FormData): Promise<TheoryMaterial> {
    try {
      const response = await fetch(`${BACKEND_URL}/content/theory`, {
        method: "POST",
        headers: getHeaders(true),
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to create theory material");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Create theory material error:", error);
      throw error;
    }
  },

  async updateTheoryMaterial(id: string, formData: FormData): Promise<TheoryMaterial> {
    try {
      const response = await fetch(`${BACKEND_URL}/content/theory/${id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update theory material");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Update theory material error:", error);
      throw error;
    }
  },

  async deleteTheoryMaterial(id: string): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/content/theory/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete theory material");
      }
    } catch (error) {
      console.error("Delete theory material error:", error);
      throw error;
    }
  },

  // Lab Materials
  async getLabMaterials(filters?: {
    language?: string;
    difficulty?: string;
    topic?: string;
    week?: number;
    search?: string;
  }): Promise<LabMaterial[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.language) params.append("language", filters.language);
      if (filters?.difficulty) params.append("difficulty", filters.difficulty);
      if (filters?.topic) params.append("topic", filters.topic);
      if (filters?.week) params.append("week", filters.week.toString());
      if (filters?.search) params.append("search", filters.search);
      
      const response = await fetch(`${BACKEND_URL}/content/lab?${params}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch lab materials");
      }
      
      const data = await response.json();
      return data.materials || [];
    } catch (error) {
      console.error("Get lab materials error:", error);
      throw error;
    }
  },

  async getLabMaterial(id: string): Promise<LabMaterial> {
    try {
      const response = await fetch(`${BACKEND_URL}/content/lab/${id}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch lab material");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get lab material error:", error);
      throw error;
    }
  },

  async createLabMaterial(formData: FormData): Promise<LabMaterial> {
    try {
      const response = await fetch(`${BACKEND_URL}/content/lab`, {
        method: "POST",
        headers: getHeaders(true),
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to create lab material");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Create lab material error:", error);
      throw error;
    }
  },

  async updateLabMaterial(id: string, formData: FormData): Promise<LabMaterial> {
    try {
      const response = await fetch(`${BACKEND_URL}/content/lab/${id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update lab material");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Update lab material error:", error);
      throw error;
    }
  },

  async deleteLabMaterial(id: string): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/content/lab/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete lab material");
      }
    } catch (error) {
      console.error("Delete lab material error:", error);
      throw error;
    }
  },

  // Stats
  async getContentStats(): Promise<ContentStats> {
    try {
      const response = await fetch(`${BACKEND_URL}/content/stats`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch content stats");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Get content stats error:", error);
      throw error;
    }
  },

  // Topics (for filters)
  async getTopics(): Promise<string[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/content/topics`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch topics");
      }
      
      const data = await response.json();
      return data.topics || [];
    } catch (error) {
      console.error("Get topics error:", error);
      throw error;
    }
  },
};

export default contentService;
