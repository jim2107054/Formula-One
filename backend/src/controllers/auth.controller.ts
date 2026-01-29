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
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
          },
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
      const { email, password, fullName, role } = req.body;
      // Basic validation
      if (!email || !password || !fullName) {
        res.status(400).json({ success: false, message: "Missing fields" });
        return;
      }

      const user = await authService.register(email, password, fullName, role);
      res.status(201).json({ success: true, message: "User created" });
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
}

export const authController = new AuthController();
