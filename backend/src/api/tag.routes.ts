import { Router } from "express";
import { TagModel } from "../models/tag.model";

const router = Router();

/**
 * @route   GET /api/tags
 * @desc    Get all tags with pagination
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const is_published = req.query.is_published;

    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    
    if (is_published !== undefined) {
      query.is_published = is_published === "true";
    }

    const [tags, totalItems] = await Promise.all([
      TagModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      TagModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: tags,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   GET /api/tag/:id
 * @desc    Get tag by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const tag = await TagModel.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }
    res.json({ success: true, data: tag });
  } catch (error) {
    console.error("Error fetching tag:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   POST /api/tag
 * @desc    Create new tag
 */
router.post("/", async (req, res) => {
  try {
    const { title, description, is_published, color } = req.body;
    
    const tag = await TagModel.create({
      title,
      description,
      is_published: is_published || false,
      color: color || "#6366f1",
    });

    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   PUT /api/tag/:id
 * @desc    Update tag
 */
router.put("/:id", async (req, res) => {
  try {
    const { title, description, is_published, color, slug } = req.body;
    
    const tag = await TagModel.findByIdAndUpdate(
      req.params.id,
      { title, description, is_published, color, slug },
      { new: true }
    );

    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    res.json({ success: true, data: tag });
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   DELETE /api/tag/:id
 * @desc    Delete tag
 */
router.delete("/:id", async (req, res) => {
  try {
    const tag = await TagModel.findByIdAndDelete(req.params.id);
    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }
    res.json({ success: true, message: "Tag deleted" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export { router as tagRoutes };
