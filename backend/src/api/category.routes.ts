import { Router } from "express";
import { CategoryModel } from "../models/category.model";

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories with pagination
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

    const [categories, totalItems] = await Promise.all([
      CategoryModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ order: 1, createdAt: -1 }),
      CategoryModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: categories,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   GET /api/category/:id
 * @desc    Get category by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   POST /api/category
 * @desc    Create new category
 */
router.post("/", async (req, res) => {
  try {
    const { title, description, is_published, parent, order } = req.body;
    
    const category = await CategoryModel.create({
      title,
      description,
      is_published: is_published || false,
      parent,
      order: order || 0,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   PUT /api/category/:id
 * @desc    Update category
 */
router.put("/:id", async (req, res) => {
  try {
    const { title, description, is_published, parent, order, slug } = req.body;
    
    const category = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      { title, description, is_published, parent, order, slug },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   DELETE /api/category/:id
 * @desc    Delete category
 */
router.delete("/:id", async (req, res) => {
  try {
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export { router as categoryRoutes };
