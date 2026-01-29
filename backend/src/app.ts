import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Import routes
import { healthRoutes } from "./api/health.routes";
import { authRoutes } from "./api/auth.routes";
import { cmsRoutes } from "./api/cms.routes";
import { chatRoutes } from "./api/chat.routes";
import { contentRoutes } from "./api/content.routes";
import { userRoutes } from "./api/user.routes";
import { categoryRoutes } from "./api/category.routes";
import { tagRoutes } from "./api/tag.routes";
import { aiRoutes } from "./api/ai.routes";

// Create Express application
const app: Application = express();

// Connect to MongoDB
import { connectDB } from "./config/database";
import { authService } from "./services/auth.service";

// Initialize database and default users
const initializeApp = async () => {
  await connectDB();
  await authService.initializeDefaultUsers();
};
initializeApp();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("combined")); // HTTP request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/tag", tagRoutes);

// AI Backend Proxy Routes
app.use("/api/ai", aiRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Resource not found",
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Server configuration
const PORT = process.env.PORT || 3000;

// Only start server if not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
}

export { app };
