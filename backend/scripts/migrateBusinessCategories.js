import mongoose from "mongoose";
import dotenv from "dotenv";

import Business from "../models/Business.js";
import Category from "../models/Category.js";

dotenv.config();

const migrateBusinessCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    const businesses = await Business.find({
      $or: [{ categoryRef: null }, { categoryRef: { $exists: false } }],
    });

    console.log(`Businesses requiring migration: ${businesses.length}`);

    let migrated = 0;
    let skipped = 0;

    for (const business of businesses) {
      if (!business.category?.trim()) {
        console.log(`Skipped "${business.name}" — no category name.`);

        skipped++;
        continue;
      }

      const category = await Category.findOne({
        name: {
          $regex: `^${business.category.trim()}$`,
          $options: "i",
        },
      });

      if (!category) {
        console.log(
          `Skipped "${business.name}" — category "${business.category}" not found.`,
        );

        skipped++;
        continue;
      }

      business.categoryRef = category._id;

      // Keep the legacy category name synchronized.
      business.category = category.name;

      await business.save();

      console.log(`Migrated "${business.name}" → ${category.name}`);

      migrated++;
    }

    console.log("--------------------------------");
    console.log(`Migrated: ${migrated}`);
    console.log(`Skipped: ${skipped}`);
    console.log("--------------------------------");

    await mongoose.disconnect();

    console.log("Migration completed.");
  } catch (error) {
    console.error("Migration error:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

migrateBusinessCategories();
