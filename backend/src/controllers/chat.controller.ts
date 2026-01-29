import { Request, Response } from "express";
import { chatOrchestratorService } from "../services/chat-orchestrator.service";

/**
 * Chat Controller
 * Handles chat-related requests
 */
class ChatController {
  /**
   * POST /api/chat/message
   * Send a message to the AI chat
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, message } = req.body;
      // Mock userId since we don't have full auth middleware context in this snippet,
      // or assume req.user is set. For now use header or default.
      const userId = (req.headers["x-user-id"] as string) || "default-user";

      if (!sessionId || !message) {
        res
          .status(400)
          .json({ success: false, message: "Missing sessionId or message" });
        return;
      }

      const result = await chatOrchestratorService.sendMessage(
        sessionId,
        userId,
        message,
      );
      res.json({ success: true, data: result });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to send message" });
    }
  }

  /**
   * GET /api/chat/history
   * Get chat history for current user
   */
  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.headers["x-user-id"] as string) || "default-user";
      const sessions = await chatOrchestratorService.getChatHistory(userId);
      res.json({ success: true, data: sessions });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to get history" });
    }
  }

  /**
   * GET /api/chat/session/:sessionId
   * Get specific chat session
   */
  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.headers["x-user-id"] as string) || "default-user";
      const session = await chatOrchestratorService.getSession(
        req.params.sessionId,
        userId,
      );

      if (!session) {
        res.status(404).json({ success: false, message: "Session not found" });
        return;
      }
      res.json({ success: true, data: session });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to get session" });
    }
  }

  /**
   * DELETE /api/chat/session/:sessionId
   * Delete a chat session
   */
  async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.headers["x-user-id"] as string) || "default-user";
      const success = await chatOrchestratorService.deleteSession(
        req.params.sessionId,
        userId,
      );

      if (!success) {
        res.status(404).json({ success: false, message: "Session not found" });
        return;
      }
      res.json({ success: true, message: "Session deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete session" });
    }
  }

  /**
   * POST /api/chat/session
   * Create new chat session
   */
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.headers["x-user-id"] as string) || "default-user";
      const { title } = req.body;
      const session = await chatOrchestratorService.createSession(
        userId,
        title,
      );
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to create session" });
    }
  }
}

export const chatController = new ChatController();
