/**
 * AI Controller
 * 
 * Handles HTTP requests for AI-related endpoints
 * Acts as a proxy between frontend and AI backend
 */

import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';

export const aiController = {
  // ==================== Health & Status ====================

  /**
   * Check AI backend health
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const health = await aiService.healthCheck();
      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'AI Backend is not available',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // ==================== Smart Agent ====================

  /**
   * Get Smart Agent status
   */
  async getAgentStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await aiService.getAgentStatus();
      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get agent status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * Upload document to agent memory
   */
  async uploadToAgent(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const result = await aiService.uploadToAgent(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to upload document',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * Smart Ask - Intelligent query routing
   */
  async agentAsk(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Query is required',
        });
        return;
      }

      const result = await aiService.agentAsk(query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Agent ask failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * Classify intent only
   */
  async classifyIntent(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Query is required',
        });
        return;
      }

      const result = await aiService.classifyIntent(query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Classification failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * Get memory status
   */
  async getMemoryStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await aiService.getMemoryStatus();
      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get memory status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * Clear memory
   */
  async clearMemory(req: Request, res: Response): Promise<void> {
    try {
      const result = await aiService.clearMemory();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to clear memory',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // ==================== Gemini RAG ====================

  /**
   * Upload to Gemini
   */
  async uploadToGemini(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const result = await aiService.uploadToGemini(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to upload to Gemini',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * Ask Gemini
   */
  async askGemini(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Query is required',
        });
        return;
      }

      const result = await aiService.askGemini(query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Gemini ask failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * List Gemini files
   */
  async listGeminiFiles(req: Request, res: Response): Promise<void> {
    try {
      const files = await aiService.listGeminiFiles();
      res.json({
        success: true,
        data: files,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to list files',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * Clear Gemini files
   */
  async clearGeminiFiles(req: Request, res: Response): Promise<void> {
    try {
      const result = await aiService.clearGeminiFiles();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to clear files',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // ==================== Generation ====================

  /**
   * Get generation status
   */
  async getGenerationStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await aiService.getGenerationStatus();
      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get generation status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * Generate theory content
   */
  async generateTheory(req: Request, res: Response): Promise<void> {
    try {
      const { topic, type } = req.body;

      if (!topic) {
        res.status(400).json({
          success: false,
          message: 'Topic is required',
        });
        return;
      }

      const result = await aiService.generateTheory({
        topic,
        type: type || 'notes',
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Theory generation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * Generate lab exercise
   */
  async generateLab(req: Request, res: Response): Promise<void> {
    try {
      const { topic, language } = req.body;

      if (!topic) {
        res.status(400).json({
          success: false,
          message: 'Topic is required',
        });
        return;
      }

      const result = await aiService.generateLab({
        topic,
        language: language || 'python',
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lab generation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // ==================== Validation ====================

  /**
   * Validate code
   */
  async validateCode(req: Request, res: Response): Promise<void> {
    try {
      const { code, problem_context } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Code is required',
        });
        return;
      }

      const result = await aiService.validateCode({
        code,
        problem_context,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Validation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};

export default aiController;
