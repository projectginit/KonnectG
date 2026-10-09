import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";
import Business from "../models/Business.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    let admin = await User.findOne({
      email: "admin@konnectg.com",
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash("temporary-password", 12);

      admin = await User.create({
        name: "KonnectG Admin",

        email: "admin@konnectg.com",

        password: hashedPassword,

        role: "admin",
      });

      console.log("Admin user created.");
    } else {
      console.log("Admin user already exists.");
    }

    // ... your existing business creation code
  } catch (error) {
    console.error("Seeding failed:", error.message);

    process.exit(1);
  }
};

seedDatabase();
