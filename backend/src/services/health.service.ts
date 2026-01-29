/**
 * Health Service
 * Provides health check functionality for the application
 */

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
}

class HealthService {
  private readonly startTime: number;
  private readonly version: string;

  constructor() {
    this.startTime = Date.now();
    this.version = process.env.npm_package_version || '0.1.0';
  }

  /**
   * Get current health status of the application
   */
  getHealthStatus(): HealthStatus {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: this.version,
    };
  }

  /**
   * Simple liveness check
   */
  isAlive(): boolean {
    return true;
  }

  /**
   * Readiness check - can be extended to check dependencies
   */
  isReady(): boolean {
    // In the future, this can check database connections, external services, etc.
    return true;
  }
}

// Export singleton instance
export const healthService = new HealthService();
