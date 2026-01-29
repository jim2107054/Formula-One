import { Router } from "express";
import { UserModel } from "../models/user.model";

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    
    if (role !== undefined && role !== "") {
      query.role = parseInt(role);
    }

    const [users, totalItems] = await Promise.all([
      UserModel.find(query)
        .select("-passwordHash")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      UserModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   GET /api/user/:id
 * @desc    Get user by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   POST /api/user
 * @desc    Create new user
 */
router.post("/", async (req, res) => {
  try {
    const { email, fullName, role, password } = req.body;
    
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || "password123", salt);

    const user = await UserModel.create({
      email,
      fullName,
      role: role || 0,
      passwordHash,
    });

    const userResponse = user.toObject();
    delete (userResponse as Record<string, unknown>).passwordHash;

    res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   PUT /api/user/:id
 * @desc    Update user
 */
router.put("/:id", async (req, res) => {
  try {
    const { fullName, role, email } = req.body;
    
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { fullName, role, email },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   DELETE /api/user/:id
 * @desc    Delete user
 */
router.delete("/:id", async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export { router as userRoutes };
