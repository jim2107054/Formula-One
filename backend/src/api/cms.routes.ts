import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller';

const router = Router();

/**
 * @route   GET /api/cms/content
 * @desc    Get all content items
 * @access  Public
 */
router.get('/content', cmsController.getAllContent);

/**
 * @route   GET /api/cms/content/:id
 * @desc    Get content by ID
 * @access  Public
 */
router.get('/content/:id', cmsController.getContentById);

/**
 * @route   POST /api/cms/content
 * @desc    Create new content
 * @access  Private (Admin)
 */
router.post('/content', cmsController.createContent);

/**
 * @route   PUT /api/cms/content/:id
 * @desc    Update content
 * @access  Private (Admin)
 */
router.put('/content/:id', cmsController.updateContent);

/**
 * @route   DELETE /api/cms/content/:id
 * @desc    Delete content
 * @access  Private (Admin)
 */
router.delete('/content/:id', cmsController.deleteContent);

/**
 * @route   POST /api/cms/upload
 * @desc    Upload file (slides, PDFs, code files)
 * @access  Private (Admin)
 */
router.post('/upload', cmsController.uploadFile);

export { router as cmsRoutes };