import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Get comprehensive health status
 * @access  Public
 */
router.get('/', healthController.getHealth);

/**
 * @route   GET /api/health/live
 * @desc    Kubernetes liveness probe
 * @access  Public
 */
router.get('/live', healthController.getLiveness);

/**
 * @route   GET /api/health/ready
 * @desc    Kubernetes readiness probe
 * @access  Public
 */
router.get('/ready', healthController.getReadiness);

export { router as healthRoutes };