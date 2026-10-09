import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, image, displayOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required.",
      });
    }

    if (!slug || !slug.trim()) {
      return res.status(400).json({
        message: "Category slug is required.",
      });
    }

    const normalizedName = name.trim();
    const normalizedSlug = slug.trim().toLowerCase();

    const existingCategory = await Category.findOne({
      $or: [{ name: normalizedName }, { slug: normalizedSlug }],
    });

    if (existingCategory) {
      if (
        existingCategory.name.toLowerCase() === normalizedName.toLowerCase()
      ) {
        return res.status(409).json({
          message: "A category with this name already exists.",
        });
      }

      return res.status(409).json({
        message: "A category with this slug already exists.",
      });
    }

    const category = await Category.create({
      name: normalizedName,
      slug: normalizedSlug,
      description: description?.trim() || "",
      icon: icon?.trim() || "",
      image: image?.trim() || "",
      displayOrder: displayOrder ?? 0,
    });

    return res.status(201).json({
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A category with this name or slug already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error while creating category.",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { search, includeInactive } = req.query;

    const filter = {};

    const isAdminOrOwner =
      req.user &&
      ["admin", "owner"].includes(req.user.role);

    if (includeInactive === "true" && isAdminOrOwner) {
      filter.isActive = { $in: [true, false] };
    } else {
      filter.isActive = true;
    }

    if (search && search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const categories = await Category.find(filter).sort({
      displayOrder: 1,
      name: 1,
    });

    return res.status(200).json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving categories.",
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid category ID.",
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      category,
    });
  } catch (error) {
    console.error("Get category by ID error:", error.message);

    return res.status(500).json({
      message: "Server error while retrieving category.",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, slug, description, icon, image, displayOrder } = req.body;

    if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid category ID.",
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Category name cannot be empty.",
        });
      }

      category.name = name.trim();
    }

    if (slug !== undefined) {
      if (!slug.trim()) {
        return res.status(400).json({
          message: "Category slug cannot be empty.",
        });
      }

      category.slug = slug.trim().toLowerCase();
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (icon !== undefined) {
      category.icon = icon.trim();
    }

    if (image !== undefined) {
      category.image = image.trim();
    }

    if (displayOrder !== undefined) {
      if (displayOrder < 0) {
        return res.status(400).json({
          message: "Display order cannot be negative.",
        });
      }

      category.displayOrder = displayOrder;
    }

    const duplicateCategory = await Category.findOne({
      $or: [{ name: category.name }, { slug: category.slug }],
      _id: { $ne: category._id },
    });

    if (duplicateCategory) {
      if (
        duplicateCategory.name.toLowerCase() === category.name.toLowerCase()
      ) {
        return res.status(409).json({
          message: "A category with this name already exists.",
        });
      }

      return res.status(409).json({
        message: "A category with this slug already exists.",
      });
    }

    await category.save();

    return res.status(200).json({
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A category with this name or slug already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error while updating category.",
    });
  }
};

export const deactivateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid category ID.",
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    category.isActive = false;

    await category.save();

    return res.status(200).json({
      message: "Category deactivated successfully.",
      category,
    });
  } catch (error) {
    console.error("Deactivate category error:", error.message);

    return res.status(500).json({
      message: "Server error while deactivating category.",
    });
  }
};

export const activateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid category ID.",
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    category.isActive = true;

    await category.save();

    return res.status(200).json({
      message: "Category activated successfully.",
      category,
    });
  } catch (error) {
    console.error("Activate category error:", error.message);

    return res.status(500).json({
      message: "Server error while activating category.",
    });
  }
};
