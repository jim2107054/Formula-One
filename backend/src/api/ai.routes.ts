/**
 * AI Routes
 * 
 * Routes for AI backend integration
 * Mirrors the AI backend API structure for seamless proxying
 */

import { Router } from 'express';
import multer from 'multer';
import { aiController } from '../controllers/ai.controller';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF and text files
    const allowedMimes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/json',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, MD, and JSON files are allowed.'));
    }
  },
});

// ==================== Health ====================
router.get('/health', aiController.healthCheck);

// ==================== Smart Agent (Primary) ====================
// GET /api/ai/agent - Agent status
router.get('/agent', aiController.getAgentStatus);

// POST /api/ai/agent/upload - Upload document to memory
router.post('/agent/upload', upload.single('file'), aiController.uploadToAgent);

// POST /api/ai/agent/ask - Smart ask (routes to theory/lab/chat)
router.post('/agent/ask', aiController.agentAsk);

// POST /api/ai/agent/classify - Classify intent only
router.post('/agent/classify', aiController.classifyIntent);

// GET /api/ai/agent/memory/status - Memory status
router.get('/agent/memory/status', aiController.getMemoryStatus);

// DELETE /api/ai/agent/memory/clear - Clear memory
router.delete('/agent/memory/clear', aiController.clearMemory);

// ==================== Gemini RAG (Direct) ====================
// POST /api/ai/gemini/upload - Upload to Gemini
router.post('/gemini/upload', upload.single('file'), aiController.uploadToGemini);

// POST /api/ai/gemini/ask - Ask Gemini
router.post('/gemini/ask', aiController.askGemini);

// GET /api/ai/gemini/files - List files
router.get('/gemini/files', aiController.listGeminiFiles);

// DELETE /api/ai/gemini/files - Clear files
router.delete('/gemini/files', aiController.clearGeminiFiles);

// ==================== Generation (Direct) ====================
// GET /api/ai/generation - Generation status
router.get('/generation', aiController.getGenerationStatus);

// POST /api/ai/generation/theory - Generate theory (slides/notes/summary)
router.post('/generation/theory', aiController.generateTheory);

// POST /api/ai/generation/lab - Generate lab exercise
router.post('/generation/lab', aiController.generateLab);

// ==================== Validation ====================
// POST /api/ai/validation/code - Validate code
router.post('/validation/code', aiController.validateCode);

export { router as aiRoutes };
