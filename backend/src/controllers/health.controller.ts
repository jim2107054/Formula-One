import { Request, Response } from 'express';
import { healthService } from '../services/health.service';

/**
 * Health Controller
 * Handles health check endpoint requests
 */
class HealthController {
  /**
   * GET /api/health
   * Returns comprehensive health status
   */
  getHealth(_req: Request, res: Response): void {
    const healthStatus = healthService.getHealthStatus();
    res.status(200).json({
      success: true,
      data: healthStatus,
    });
  }

  /**
   * GET /api/health/live
   * Kubernetes liveness probe endpoint
   */
  getLiveness(_req: Request, res: Response): void {
    if (healthService.isAlive()) {
      res.status(200).json({
        success: true,
        message: 'Service is alive',
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Service is not alive',
      });
    }
  }

  /**
   * GET /api/health/ready
   * Kubernetes readiness probe endpoint
   */
  getReadiness(_req: Request, res: Response): void {
    if (healthService.isReady()) {
      res.status(200).json({
        success: true,
        message: 'Service is ready',
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Service is not ready',
      });
    }
  }
}

export const healthController = new HealthController();
