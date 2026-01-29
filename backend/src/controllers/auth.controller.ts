import { Request, Response } from "express";
import { authService } from "../services/auth.service";

class AuthController {
  // Login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      if (!result) {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
        return;
      }

      // Return token and user info (excluding password)
      const { token, user } = result;
      res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          username: user.email.split('@')[0],
          name: user.fullName,
          email: user.email,
          role: user.role,
          imageUrl: "/images/avatars/default.png",
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Register
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName, name, username, role } = req.body;
      const userFullName = fullName || name || username || email.split('@')[0];
      
      // Basic validation
      if (!email || !password) {
        res.status(400).json({ success: false, message: "Missing fields" });
        return;
      }

      const user = await authService.register(email, password, userFullName, role);
      
      // Auto login after register
      const loginResult = await authService.login(email, password);
      if (loginResult) {
        res.status(201).json({
          success: true,
          token: loginResult.token,
          user: {
            _id: user._id,
            username: email.split('@')[0],
            name: userFullName,
            email: user.email,
            role: user.role,
            imageUrl: "/images/avatars/default.png",
          },
        });
      } else {
        res.status(201).json({ success: true, message: "User created" });
      }
    } catch (e: any) {
      if (e.code === 11000) {
        res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      } else {
        res.status(500).json({ success: false, message: "Server error" });
      }
    }
  }

  // Logout
  async logout(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: "Logged out successfully" });
  }

  // Get current user
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // Get user from token (middleware should have added it)
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ success: false, message: "No token provided" });
        return;
      }
      
      const token = authHeader.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
      
      const { UserModel } = require('../models/user.model');
      const user = await UserModel.findById(decoded.id);
      
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      res.json({
        success: true,
        _id: user._id,
        id: user._id,
        username: user.email.split('@')[0],
        name: user.fullName,
        email: user.email,
        role: user.role,
        imageUrl: "/images/avatars/default.png",
      });
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: "Invalid token" });
    }
  }
}

export const authController = new AuthController();
