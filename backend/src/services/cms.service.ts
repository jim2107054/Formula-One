import { ContentModel, IContent } from "../models/content.model";

export type ContentCategory = "theory" | "lab";
export type ContentType = "slides" | "pdf" | "code" | "notes";

export interface ContentCreateDTO {
  title: string;
  description: string;
  category: ContentCategory;
  metadata: {
    topic: string;
    week: number;
    tags: string[];
    contentType: ContentType;
  };
  filePath?: string;
  fileName?: string;
}

class CmsService {
  async getAllContent(category?: ContentCategory): Promise<IContent[]> {
    const filter = category ? { category } : {};
    return ContentModel.find(filter).sort({ createdAt: -1 });
  }

  async getContentById(id: string): Promise<IContent | null> {
    try {
      return await ContentModel.findById(id);
    } catch {
      return null;
    }
  }

  async createContent(data: ContentCreateDTO): Promise<IContent> {
    const content = new ContentModel(data);
    return content.save();
  }

  async updateContent(
    id: string,
    data: Partial<ContentCreateDTO>,
  ): Promise<IContent | null> {
    try {
      return await ContentModel.findByIdAndUpdate(id, data, { new: true });
    } catch {
      return null;
    }
  }

  async deleteContent(id: string): Promise<boolean> {
    try {
      const result = await ContentModel.findByIdAndDelete(id);
      return !!result;
    } catch {
      return false;
    }
  }

  async processUploadedFile(file: Express.Multer.File): Promise<string> {
    return file.path;
  }
}

export const cmsService = new CmsService();
