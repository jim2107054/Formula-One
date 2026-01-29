import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';

const router = Router();

/**
 * @route   POST /api/chat/message
 * @desc    Send a message to the AI chat
 * @access  Private
 */
router.post('/message', chatController.sendMessage);

/**
 * @route   GET /api/chat/history
 * @desc    Get chat history for current user
 * @access  Private
 */
router.get('/history', chatController.getChatHistory);

/**
 * @route   GET /api/chat/session/:sessionId
 * @desc    Get specific chat session
 * @access  Private
 */
router.get('/session/:sessionId', chatController.getSession);

/**
 * @route   DELETE /api/chat/session/:sessionId
 * @desc    Delete a chat session
 * @access  Private
 */
router.delete('/session/:sessionId', chatController.deleteSession);

/**
 * @route   POST /api/chat/session
 * @desc    Create new chat session
 * @access  Private
 */
router.post('/session', chatController.createSession);

export { router as chatRoutes };