import { v4 as uuidv4 } from "uuid";
import { readJson, writeJson } from "../utils/fileStore";
import fs from "fs/promises";
import path from "path";

/**
 * CMS Service
 * Handles content management system business logic
 */

export type ContentCategory = "theory" | "lab";
export type ContentType = "slides" | "pdf" | "code" | "notes";

export interface ContentMetadata {
  topic: string;
  week: number;
  tags: string[];
  contentType: ContentType;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  metadata: ContentMetadata;
  filePath?: string;
  fileName?: string;
  createdAt: string; // Store as string for JSON
  updatedAt: string;
}

export interface ContentCreateDTO {
  title: string;
  description: string;
  category: ContentCategory;
  metadata: ContentMetadata;
  filePath?: string;
  fileName?: string;
}

const CONTENT_FILE = "content.json";
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

class CmsService {
  /**
   * Get all content items
   */
  async getAllContent(category?: ContentCategory): Promise<Content[]> {
    const allContent = await readJson<Content>(CONTENT_FILE);
    if (category) {
      return allContent.filter((c) => c.category === category);
    }
    return allContent;
  }

  /**
   * Get content by ID
   */
  async getContentById(id: string): Promise<Content | null> {
    const allContent = await readJson<Content>(CONTENT_FILE);
    return allContent.find((c) => c.id === id) || null;
  }

  /**
   * Create new content
   */
  async createContent(data: ContentCreateDTO): Promise<Content> {
    const allContent = await readJson<Content>(CONTENT_FILE);

    const newContent: Content = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allContent.push(newContent);
    await writeJson(CONTENT_FILE, allContent);

    return newContent;
  }

  /**
   * Update content
   */
  async updateContent(
    id: string,
    data: Partial<ContentCreateDTO>,
  ): Promise<Content | null> {
    const allContent = await readJson<Content>(CONTENT_FILE);
    const index = allContent.findIndex((c) => c.id === id);

    if (index === -1) return null;

    const updatedContent = {
      ...allContent[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    allContent[index] = updatedContent;
    await writeJson(CONTENT_FILE, allContent);

    return updatedContent;
  }

  /**
   * Delete content
   */
  async deleteContent(id: string): Promise<boolean> {
    const allContent = await readJson<Content>(CONTENT_FILE);
    const filtered = allContent.filter((c) => c.id !== id);

    if (filtered.length === allContent.length) return false;

    // Check if file exists and delete it
    const itemToDelete = allContent.find((c) => c.id === id);
    if (itemToDelete && itemToDelete.filePath) {
      try {
        await fs.unlink(itemToDelete.filePath);
      } catch (e) {
        console.error("Failed to delete file:", e);
      }
    }

    await writeJson(CONTENT_FILE, filtered);
    return true;
  }

  /**
   * Upload file and associate with content
   * Note: This implementation assumes file is already saved by multer
   * returns relative path
   */
  async processUploadedFile(file: Express.Multer.File): Promise<string> {
    // Return relative path or absolute? Relative is better for portability
    // Multer saves it to uploads/filename
    return file.path;
  }

  /**
   * Search content by query
   */
  async searchContent(
    query: string,
    category?: ContentCategory,
  ): Promise<Content[]> {
    const allContent = await readJson<Content>(CONTENT_FILE);
    const lowerQuery = query.toLowerCase();

    return allContent.filter((c) => {
      const matchesCategory = category ? c.category === category : true;
      const matchesQuery =
        c.title.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery) ||
        c.metadata.topic.toLowerCase().includes(lowerQuery) ||
        c.metadata.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));

      return matchesCategory && matchesQuery;
    });
  }
}

export const cmsService = new CmsService();
