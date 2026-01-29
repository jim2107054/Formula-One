import { Request, Response } from "express";
import { cmsService } from "../services/cms.service";

/**
 * CMS Controller
 * Handles content management system requests
 */
class CmsController {
  /**
   * GET /api/cms/content
   * Get all content items
   */
  async getAllContent(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as any;
      const content = await cmsService.getAllContent(category);
      res.json({ success: true, data: content });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * GET /api/cms/content/:id
   * Get content by ID
   */
  async getContentById(req: Request, res: Response): Promise<void> {
    try {
      const content = await cmsService.getContentById(req.params.id);
      if (!content) {
        res.status(404).json({ success: false, message: "Content not found" });
        return;
      }
      res.json({ success: true, data: content });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * POST /api/cms/content
   * Create new content
   */
  async createContent(req: Request, res: Response): Promise<void> {
    try {
      const content = await cmsService.createContent(req.body);
      res.status(201).json({ success: true, data: content });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * PUT /api/cms/content/:id
   * Update content
   */
  async updateContent(req: Request, res: Response): Promise<void> {
    try {
      const content = await cmsService.updateContent(req.params.id, req.body);
      if (!content) {
        res.status(404).json({ success: false, message: "Content not found" });
        return;
      }
      res.json({ success: true, data: content });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * DELETE /api/cms/content/:id
   * Delete content
   */
  async deleteContent(req: Request, res: Response): Promise<void> {
    try {
      const success = await cmsService.deleteContent(req.params.id);
      if (!success) {
        res.status(404).json({ success: false, message: "Content not found" });
        return;
      }
      res.json({ success: true, message: "Content deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * POST /api/cms/upload
   * Upload file
   */
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }
      // Multer handled the saving, we just need to return the path/info
      // We might want to create a Content entry here or just return the path for the frontend to include in the next request

      const filePath = req.file.path;
      const fileName = req.file.originalname;

      res.status(201).json({
        success: true,
        data: {
          filePath,
          fileName,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  }
}

export const cmsController = new CmsController();
